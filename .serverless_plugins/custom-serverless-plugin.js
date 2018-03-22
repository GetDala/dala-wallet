'use strict';

const util = require('util');
const AWS = require('aws-sdk');
var a = new AWS.APIGateway();


class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');

    this.hooks = {
      'after:deploy:deploy': this.addVpcLinksToApiEndpoints.bind(this),
    };
  }

  loadCustom(custom) {
    let pluginCustom = {};
    if (custom && custom.vpcLinks) {
      pluginCustom = custom.vpcLinks;
      // pluginCustom.baseUri = custom.vpcLinks.baseUri;
      // pluginCustom.vpcLinkId = custom.vpcLinks.vpcLinkId;
    }

    return pluginCustom;
  }

  getStackResources() {
    this.stackName = util.format('%s-%s',
      this.serverless.service.getServiceName(),
      this.provider.getStage()
    );
    return this.provider.request(
      'CloudFormation',
      'listStackResources',
      {
        StackName: this.stackName
      },
      this.provider.getStage(),
      this.provider.getRegion()
    );
  }

  getApiResources(restApiId) {
    return this.provider.request(
      'APIGateway',
      'getResources',
      { restApiId },
      this.provider.getStage(),
      this.provider.getRegion()
    )
  }

  camel(path) {
    const elements = path.split('/');
    return elements.map(val => {
      if (val.startsWith('{') && val.endsWith('}')) {
        return val.substring(1, 2).toUpperCase() + val.substring(2, val.length - 1) + 'Var';
      }
      return val.substring(0, 1).toUpperCase() + val.substring(1);
    }).join('');

  }

  camelMethod(method) {
    return method.substring(0, 1).toUpperCase() + method.substring(1).toLowerCase();
  }

  getParameters(path) {
    return path.split('/').filter(part => part.startsWith('{') && part.endsWith('}')).map(part => part.substring(1, part.length - 1));
  }

  putVpcLinkIntegration(restApiId, method) {
    const camelPath = this.camel(method.path);
    const camelMethod = this.camelMethod(method.resourceMethods.method);
    const logicalResourceId = `ApiGatewayMethod${camelPath}${camelMethod}`;
    const payload = {
      httpMethod: method.resourceMethods.method,
      integrationHttpMethod: method.resourceMethods.method,
      resourceId: method.id,
      restApiId
    }
    return this.getValueFromCf(this.pluginCustom.baseUri).then(baseUri => {
      const api = this.pluginCustom.apis[logicalResourceId];
      if (api) {
        if (api.enabled) {
          //create VPC_LINK HTTP_PROXY
          payload.type = 'HTTP_PROXY';
          payload.connectionId = this.pluginCustom.vpcLinkId;
          payload.connectionType = 'VPC_LINK';
          payload.uri = `${baseUri}${method.path}`;
          payload.requestParameters = {};
          const pathParameters = this.getParameters(method.path);
          pathParameters.forEach(pp => {
            payload.requestParameters[`integration.request.path.${pp}`] = `method.request.path.${pp}`;
          });
        } else {
          //create AWS_PROXY
          const lambdaFunction = `${api.functionArn}`;
          const region = this.provider.getRegion();
          payload.type = 'AWS_PROXY';
          payload.uri = `arn:aws:apigateway:${region}:lambda:path/2015-03-31/functions/${lambdaFunction}/invocations`
        }
        return this.provider.request(
          'APIGateway',
          'getMethod',
          {
            restApiId,
            httpMethod: payload.httpMethod,
            resourceId: payload.resourceId
          },
          this.provider.getStage(),
          this.provider.getRegion()
        ).then(apiMethod => {
          const { methodIntegration } = apiMethod;
          if (methodIntegration) {
            const { uri, connectionType, requestParameters } = methodIntegration;
            if (uri == payload.uri && connectionType == payload.connectionType && this.objectEquals(requestParameters, payload.requestParameters)) {
              this.serverless.cli.log(`custom: Integration for ${method.path} has already been created`);
              return;
            } else {
              this.serverless.cli.log(`custom: Integration for ${method.path} is being created`);
            }
          }
          return this.provider.request(
            'APIGateway',
            'putIntegration',
            payload,
            this.provider.getStage(),
            this.provider.getRegion()
          );
        });
      }
    })
  }

  getValueFromCf(variableString) {
    if (!this.pluginCustom.baseUri.startsWith('http://')) {
      const variableStringWithoutSource = variableString.split('.');
      const stackName = variableStringWithoutSource[0];
      const outputLogicalId = variableStringWithoutSource[1];
      return this.serverless.getProvider('aws')
        .request('CloudFormation',
          'describeStacks',
          { StackName: stackName },
          { useCache: true })
        .then((result) => {
          const outputs = result.Stacks[0].Outputs;
          const output = outputs.find(x => x.OutputKey === outputLogicalId);

          if (output === undefined) {
            const errorMessage = [
              'Trying to request a non exported variable from CloudFormation.',
              ` Stack name: "${stackName}"`,
              ` Requested variable: "${outputLogicalId}".`,
            ].join('');
            return Promise.reject(new this.serverless.classes.Error(errorMessage));
          }
          return Promise.resolve(output.OutputValue);
        });
    }
    return Promise.resolve(variableString);
  }

  objectEquals(obj1, obj2) {
    if (obj1 && !obj2) return false;
    if (!obj1 && obj2) return false;
    var result = true;
    if (obj1 && obj2) {
      for (var prop in obj1) {
        var val1 = obj1[prop];
        var val2 = obj2[prop];
        if (val1 != val2) {
          result = false;
        }
      }
    }
    return result;
  }

  addVpcLinksToApiEndpoints() {
    this.pluginCustom = this.loadCustom(this.serverless.service.custom);
    let restApiId;
    return this.getStackResources().then(resources => {
      let resource = resources.StackResourceSummaries.find(x => x.LogicalResourceId === 'ApiGatewayRestApi');
      if(resource){
        restApiId = resources.StackResourceSummaries.find(x => x.LogicalResourceId === 'ApiGatewayRestApi').PhysicalResourceId;
        return this.getApiResources(restApiId);
      }
      return [];
    }).then(apis => {
      const methods = apis.items.filter(api => !!api.resourceMethods);
      const allMethods = [];
      methods.forEach(method => {
        for (var prop in method.resourceMethods) {
          if (prop !== 'OPTIONS') {
            let { id, parentId, pathPart, path } = method;
            const newMethod = {
              id,
              parentId,
              pathPart,
              path,
              resourceMethods: {
                method: prop,
                [prop]: method.resourceMethods[prop]
              }
            };
            allMethods.push(newMethod);
          }
        }
      });
      return Promise.all(allMethods.map(method => {
        return this.putVpcLinkIntegration(restApiId, method);
      })).then((results) => {
        this.serverless.cli.log(`custom: VPC Links added`);
        return this.provider.request(
          'APIGateway',
          'createDeployment',
          {
            restApiId
          },
          this.provider.getStage(),
          this.provider.getRegion()
        )
      }).then(() => {
        this.serverless.cli.log('custom: API deployed');
      });
    });
  }
}

module.exports = ServerlessPlugin;
