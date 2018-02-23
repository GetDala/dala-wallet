'use strict';

const util = require('util');
const AWS = require('aws-sdk');
var a = new AWS.APIGateway();


class ServerlessPlugin {
  constructor(serverless, options) {
    this.serverless = serverless;
    this.options = options;
    this.provider = this.serverless.getProvider('aws');
    this.pluginCustom = this.loadCustom(this.serverless.service.custom);

    this.hooks = {
      'after:deploy:deploy': this.addVpcLinksToApiEndpoints.bind(this),
    };
  }

  loadCustom(custom) {
    const pluginCustom = {};
    if (custom && custom.vpcLinks) {
      pluginCustom.baseUri = custom.vpcLinks.baseUri;
      pluginCustom.vpcLinkId = custom.vpcLinks.vpcLinkId;
    }

    return pluginCustom;
  }

  getStackResources() {
    this.stackName = util.format('%s-%s',
      this.serverless.service.getServiceName(),
      this.serverless.getProvider('aws').getStage()
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

  putVpcLinkIntegration(restApiId, method) {
    const payload = {
      httpMethod: method.resourceMethods.method,
      integrationHttpMethod: method.resourceMethods.method,
      resourceId: method.id,
      restApiId,
      type: 'HTTP_PROXY',
      connectionId: this.pluginCustom.vpcLinkId,
      connectionType: 'VPC_LINK',
      uri: `${this.pluginCustom.baseUri}${method.path}`
    };
    console.log(payload);
    return this.provider.request(
      'APIGateway',
      'putIntegration',
      payload,
      this.provider.getStage(),
      this.provider.getRegion()
    );
  }

  addVpcLinksToApiEndpoints() {
    let restApiId;
    return this.getStackResources().then(resources => {
      restApiId = resources.StackResourceSummaries.find(x => x.LogicalResourceId === 'ApiGatewayRestApi').PhysicalResourceId;
      return this.getApiResources(restApiId);
      // const methods = resources.StackResourceSummaries.filter(x=>x.ResourceType === 'AWS::ApiGateway::Method')
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
        console.log(JSON.stringify(results));
      });;
    });
    // if (this.options.noDeploy === true) {
    //   return Promise.resolve();
    // }

    // const resources = this.serverless.service.provider.compiledCloudFormationTemplate.Resources
    // Object.keys(resources).map(resourceName => {
    //   const resource = resources[resourceName]
    //   if (resource.Type === 'AWS::ApiGateway::Method') {
    //     console.log(JSON.stringify(resource));
    //     // const method = resource.Properties.HttpMethod.toUpperCase()
    //     // const resourceId = resource.Properties.ResourceId.Ref;
    //     // const path = this.getResourcePath(resources[resource.Properties.ResourceId.Ref], resources)
    //     // if (this.cfAuthorizers[path]) {
    //     //   const cfAuthorizer = this.cfAuthorizers[path][method]
    //     //   if (cfAuthorizer) {
    //     //     this.serverless.cli.log('Adding CloudFormation Authorizer ' + cfAuthorizer + ' to ' + method + ' ' + path)
    //     //     resource.Properties.AuthorizationType = this.serverless.service.custom.cfAuthorizers[cfAuthorizer].Type
    //     //     resource.Properties.AuthorizerId = {Ref:cfAuthorizer}
    //     //   }
    //     // }
    //   }
    // });
  }
}

module.exports = ServerlessPlugin;
