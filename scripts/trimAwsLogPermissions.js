const resources = serverless.service.provider.compiledCloudFormationTemplate.Resources;

if (resources.IamRoleLambdaExecution && resources.IamRoleLambdaExecution.Type === 'AWS::IAM::Role') {
    resources.IamRoleLambdaExecution.Properties.Policies.forEach(policy => {
        if (Array.isArray(policy.PolicyDocument.Statement)) {
            policy.PolicyDocument.Statement.forEach(policyStatement => {
                if (policyStatement.Action.includes('logs:CreateLogStream')) {
                    policyStatement.Resource = [{
                        "Fn::Sub": "arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/" +
                            serverless.service.service + "*:*"
                    }]
                }
                if (policyStatement.Action.includes('logs:PutLogEvents')) {
                    policyStatement.Resource = [{
                        "Fn::Sub": "arn:aws:logs:${AWS::Region}:${AWS::AccountId}:log-group:/aws/lambda/" +
                            serverless.service.service + "*:*:*"
                    }]
                }
            });
        }
    });
}