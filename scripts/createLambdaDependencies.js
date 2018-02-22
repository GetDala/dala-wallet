var fs = require('fs');
var lines = fs.readFileSync('./lambdas.list').split('\n');
var results = []
lines.forEach((line, index) => {
    var name = line.substring(0, 1).toUpperCase() + line.substring(1) + 'LambdaFunction'
    var type = 'AWS::Lambda::Function'
    var nextOne = ((index + 1) >= lines.length ? null : lines[(index + 1)])
    var nextName = (nextOne == null ? '' : nextOne.substring(0, 1).toUpperCase() + nextOne.substring(1) + 'LambdaFunction')
    results.push({
        Name: name,
        Type: type,
        DependsOn: nextName
    })
});
var final = results.map(result => {
    return `"${result.Name}":\n\t"Type":"${result.Type}"\n\t"DependsOn":"${result.DependsOn}"\n`;
}).join("");
fs.writeFileSync('./results.yml', final);