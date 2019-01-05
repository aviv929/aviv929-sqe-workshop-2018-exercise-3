


let table=[];

function FunctionDeclaration(parsed)
{
    let tmp=[parsed.loc.start.line,'function declaration',parsed.id.name,'',''];
    table.push(tmp);
    for (let i = 0; i < parsed.params.length; i++)
    {
        param(parsed.params[i]);
    }
    body(parsed.body);
}
function param(parsed)
{
    let tmp=[parsed.loc.start.line,'variable declaration',parsed.name,'',null];
    table.push(tmp);
}
function VariableDeclaration(parsed)
{
    for (let i = 0; i < parsed.declarations.length; i++)
    {
        let value=parsed.declarations[i].init;
        if (value!=null)
            value=Expression(value);
        let tmp=[parsed.declarations[i].loc.start.line,'variable declaration',parsed.declarations[i].id.name,'',value];
        table.push(tmp);
    }
}
function WhileStatement(parsed)
{
    let tmp=[parsed.loc.start.line,'while statement','',Expression(parsed.test),''];
    table.push(tmp);

    body(parsed.body);
}
function IfStatement(parsed,loop)
{
    if (parsed.type==='IfStatement')
    {
        let tmp=[parsed.loc.start.line,'','',Expression(parsed.test),''];
        if (loop===0)            tmp[1]='if statement';        //else if(parsed.alternate===undefined)        //    tmp[1]='else statement';
        else            tmp[1]='else if statement';
        table.push(tmp);
        if (parsed.consequent.type!='BlockStatement')            parsed.consequent={type:'BlockStatement',body:[parsed.consequent]};
        body(parsed.consequent);
        if(parsed.alternate!=undefined)            IfStatement(parsed.alternate,loop+1);
    }
    else
    {
        let tmp=[parsed.loc.start.line-1,'else statement','','',''];
        table.push(tmp);        //if (parsed.type!='BlockStatement')
        parsed={type:'BlockStatement',body:[parsed]};
        body(parsed);
    }
}
function ReturnStatement(parsed)
{
    let tmp=[parsed.loc.start.line,'return statement','','',Expression(parsed.argument)];
    table.push(tmp);
}
function ForStatement(parsed)
{
    let tmp=[parsed.loc.start.line,'for statement',parsed.init.left.name+'='+Expression(parsed.init.right),Expression(parsed.test),parsed.update.left.name+'='+Expression(parsed.update.right)];
    table.push(tmp);

    body(parsed.body);
}



function AssignmentExpression(parsed)
{
    let tmp=[parsed.loc.start.line,'assignment expression',Expression(parsed.left),'',Expression(parsed.right)];
    table.push(tmp);
}
function Expression(parsed)
{
    if(parsed.type==='Literal')
        return parsed.value;
    else if(parsed.type==='Identifier')
        return parsed.name;
    else if(parsed.type==='MemberExpression')
        return Expression(parsed.object) + '[' + Expression(parsed.property) + ']';
    else if(parsed.type==='UnaryExpression')
        return '('+parsed.operator+Expression(parsed.argument)+')';
    else //if(parsed.type==='BinaryExpression')
        return '('+Expression(parsed.left)+parsed.operator+Expression(parsed.right)+')';
}
function ExpressionStatement(parsed)
{
    //if (parsed.type==='AssignmentExpression')
    AssignmentExpression(parsed);
    //else if (parsed.type==='BinaryExpression')
    //AssignmentExpression(parsed);
}


function body(parsed)
{
    if (parsed.type === 'BlockStatement')
        body(parsed.body);
    for (let i = 0; i < parsed.length; i++)
    {
        body2(parsed[i]);
    }
}
function body2(parsed)
{
    if (parsed.type === 'FunctionDeclaration')      FunctionDeclaration(parsed);
    else if (parsed.type === 'VariableDeclaration') VariableDeclaration(parsed);
    else if (parsed.type === 'ExpressionStatement') ExpressionStatement(parsed.expression);
    else body3(parsed);
}
function body3(parsed)
{
    if (parsed.type === 'WhileStatement')      WhileStatement(parsed);
    else if (parsed.type === 'ReturnStatement')     ReturnStatement(parsed);
    else if (parsed.type === 'IfStatement')         IfStatement(parsed,0);
    else body4(parsed);

}
function body4(parsed)
{
    if (parsed.type === 'ForStatement') {
        ForStatement(parsed);
        return;
    }
    //else if (parsed.type === 'BlockStatement')
    body(parsed.body);
}

function convert1(parsed)
{
    table=[];
    body(parsed.body);
    //let ans=table;
    return table;
}
function convert2(struct)
{
    let s='<tr><td>Line</td><td>Type</td><td>Name</td><td>Condition</td><td>Value</td></tr>';
    for (let i = 0; i < struct.length; i++)
        s+='<tr><td>'+struct[i][0]+'</td><td>'+struct[i][1]+'</td><td>'+struct[i][2]+'</td><td>'+struct[i][3]+'</td><td>'+struct[i][4]+'</td></tr>';
    return s;
}

export {convert1,convert2};