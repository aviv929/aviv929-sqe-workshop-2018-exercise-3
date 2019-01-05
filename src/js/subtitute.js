let mirrors={};
let mirrorVal='*';

let values={};

let codeToParse=null;
let inputArgs=null;
let parsed=null;

function convert3(_codeToParse,_args,_parsed){
    codeToParse=_codeToParse;
    inputArgs=_args;
    parsed=_parsed;

    stackN =[new Graph(0,'function','',true)];
    runId=1;
    text='';
    prepare();
    body();

    manageGraph('');
    connectGraph1();
    connectGraph2();
    makeGraph(stackN[0],true);
    disconnectEnd(stackN[0]);

    let g=draw();
    return g;
}

function prepare(){
    let k=seperateNames();
    let v=seperateArgs();
    for (let i = 0; i <k.length ; i++) {
        handlee(k[i],v[i]);
    }
}
function seperateNames(){
    let arr=[];
    let funcLine=-1;
    for (let i = 0; i < parsed.length; i++) {
        if (funcLine===parsed[i][0])
            arr.push(parsed[i][2]);
        if (parsed[i][1] === 'function declaration')
            funcLine = parsed[i][0];
    }
    return arr;
}
function seperateArgs(){
    let arr=[];
    let count=0;
    let s='';
    for (let i = 0; i <inputArgs.length ; i++) {
        s=s+inputArgs[i];
        if(inputArgs[i]==='[')
            count++;
        if(inputArgs[i]===']')
            count--;
        s=seperateArgs2(i,s,count,arr);
    }
    if (s!='')
        arr.push(s);
    return arr;
}
function seperateArgs2(i,s,count,arr){
    if (inputArgs[i]===','&&count===0)
    {
        s=s.substring(0,s.length-1);
        arr.push(s);
        s='';
    }
    return s;
}
function handlee(k,v){
    values[k]=v;
    if(v[0]==='[') {
        v = v.substring(1);
        v = v.substring(0, v.length - 1);
        let arr = v.split(',');
        for (let i = 0; i < arr.length; i++)
        {
            values[k+'['+i+']']=arr[i];
        }
    }

}

function body(){
    let arr=codeToParse.split('\n');
    let index=0;
    let repit=[];
    for (let i = 0; i < arr.length; i++)
    {
        if (body2(arr,index,i))
        {
            if (!(i in repit)) {
                repit.push(i);
                manageGraph(arr[i]);
            }
            continue;
        }
        body3(arr,repit,index,i);
        index++;
        i--;
    }
}
function body2(arr,index,i){
    changeMirror(arr[i]);
    return index>=parsed.length||i+1!=parsed[index][0];
}
function body3(arr,repit,index,i){
    if (parsed[index][1] === 'variable declaration'||parsed[index][1] === 'assignment expression')
        varDec(parsed[index]);
    if (!(i in repit)) {
        repit.push(i);
        manageGraph(arr[i]);
    }
}

function changeMirror(row){
    if(row.includes('{'))
    {
        mirrors[mirrorVal]=values;
        mirrorVal=mirrorVal+'*';
        values=copy(values);
    }
    else if(row.includes('}'))
    {
        mirrorVal=mirrorVal.substring(0,mirrorVal.length-1);
        values=copy(mirrors[mirrorVal]);
    }

}
function copy(map){
    let tmp={};
    for(var key in map)
        tmp[key]=map[key];
    return tmp;
}

function varDec(row){
    let val=eval( clearify(row[4], false))  ;
    if (values[row[2]]===undefined)
        values[row[2]] = val;
    else if (values[row[2]]!=undefined&&val!='null'&&val!=null)
        values[row[2]] = val;
}

function clearify(expression,replaceArgs){
    expression=expression+'';
    let terms=[];

    clearify2(expression,replaceArgs,terms);
    let s='';
    for (let i = 0; i <terms.length ; i++) {
        s=s+terms[i];
    }
    return s;
}
function clearify2(expression,replaceArgs,terms){
    let s='';
    for (let i = 0; i <expression.length ; i++)
    {
        if ('1234567890[_]abcdefghijklmnopqrstuvwxyz'.includes(expression[i]))
            s=s+expression[i];
        else {
            if (s!='') {
                terms.push(switchh(s));
                s='';
            }
            terms.push(expression[i]);
        }
    }
    if(s!='')
        terms.push(switchh(s));
}
function switchh(term){
    if (values[term]!=undefined)
        return values[term];
    return term;
}



class Graph{
    constructor(id,shape,text,mainRoad) {
        this.id = id;
        this.shape=shape;
        this.text=text;
        this.mainRoad=mainRoad;
        this.t=null;
        this.f=null;
    }

    setT(graph)
    {
        this.t=graph;
    }
    setF(graph)
    {
        this.f=graph;
    }
}

let text='';
let runId=1;
let stackN =[new Graph(0,'function','',true)];

function manageGraph(row){
    if(row.includes('else if')){
        reg();
        let tmp=rem(row.replace('else if',''));
        stackN.push(new Graph(runId,'else if',tmp,eval(clearify(tmp,true))));
        runId++;    }
    else if(row.includes('if')){
        reg();
        let tmp=rem(row.replace('if',''));
        stackN.push(new Graph(runId,'if',tmp,eval(clearify(tmp,true))));
        runId++;    }
    else if(row.includes('else')){
        reg();
        let tmp=rem(row.replace('else',''));
        stackN.push(new Graph(runId,'else',tmp,eval(clearify(tmp,true))));
        runId++;    }
    else        manageGraph2(row);
}
function manageGraph2(row) {
    if (row.includes('while')) {
        reg();
        let tmp = rem(row.replace('while', '').replace('{', ''));
        stackN.push(new Graph(runId, 'while', tmp, eval(clearify(tmp, true))));
        runId++;
    }
    else if (row.includes('function') || row.includes('{'))
        return;//nothing
    else if (row.includes('}')) {
        reg();
        stackN.push(new Graph(runId, 'end', '', false));
        runId++;
    }
    else manageGraph3(row);
}
function manageGraph3(row){
    if (row === '') {
        reg();
    }
    else {//let, return
        text = text + row.replace('let ', '').replace(';', '') + '\n';
        text = rem(text);
        text = text.replace('return', 'return ');
    }
}
function reg(){
    if (text!='')
    {
        stackN.push( new Graph(runId, 'regular', text, false));
        runId++;
        text='';
    }
}
function rem(t) {
    while(t.includes(' '))
        t=t.replace(' ','');
    return(t);
}

function connectGraph1(){
    for (let i = 0; i < stackN.length; i++)
    {
        if(stackN[i].shape ==='end')
            ;
        else if(stackN[i].shape ==='regular')
            stackN[i].setT(stackN[i+1]);
        else if(stackN[i].shape ==='function')
        {
            stackN[i].setT(stackN[i+1]);
            let index=end(i);
            stackN[i].setF(stackN[index]);
        }

        else
            connectGraph11(i);

    }
}
function connectGraph11(i) {
    if (stackN[i].shape === 'if') {
        stackN[i].setT(stackN[i + 1]);
        let index = end(i);
        if (che(stackN[index + 1].shape, ['else if', 'else']))
            index++;
        stackN[i].setF(stackN[index]);
    }
    else if (stackN[i].shape === 'else if') {
        stackN[i].setT(stackN[i + 1]);
        let index = end(i);
        if (che(stackN[index + 1].shape, ['else if', 'else']))
            index++;
        stackN[i].setF(stackN[index]);
    }
    else
        connectGraph111(i);
}
function connectGraph111(i) {

    if (stackN[i].shape === 'else') {
        stackN[i].setT(stackN[i + 1]);
        let index = end(i);
        stackN[i].setF(stackN[index]);
        return;
    }
    //else if (stackN[i].shape === 'while') {
    stackN[i].setT(stackN[i + 1]);
    let index = end(i);
    stackN[index].setT(stackN[i]);
    stackN[i].setF(stackN[index + 1]);
    //}
}

function connectGraph2(){
    for (let i = 0; i <stackN.length-1; i++)
        connectGraph22(i);
    for (let i = 0; i <stackN.length-1; i++)
    {
        if (stackN[i].shape==='regular'&&stackN[i].text.includes('return'))
            stackN[i].t=null;
    }
}
function connectGraph22(i){
    if(stackN[i].shape ==='end'&&stackN[i].t == null)
    {
        stackN[i].t=stackN[i+1];
    }
    else if(che(stackN[i].shape , ['if','else if','else']))
    {
        let from = stackN[end(i)];
        let to= endIf(i);
        if (from!=to)
            from.t=to;
    }
}

function disconnectEnd(graph) {
    if (graph == null)
        return;

    let flag=false;
    if(graph.f != null && graph.f.shape === 'else')
    {
        graph.f=graph.f.t;
        flag=true;
    }
    flag=disconnectEnd2(graph,flag);

    if (flag)
        disconnectEnd(graph);
    else
        disconnectEnd7(graph);
}
function disconnectEnd2(graph,flag){
    if (disconnectEnd3(graph,0)) {
        if (disconnectEnd4(graph)) {
            graph.t = graph.t.t;
            flag=true;
        }
        //if (disconnectEnd4(graph,1)) {
        //    graph.t = graph.t.f;
        //    flag=true;
        //}
    }
    flag=disconnectEnd6(graph,flag)||flag;
    return flag;
}
function disconnectEnd3(graph,id){
    if(id===0)
        return graph.t != null && graph.t.shape === 'end';
    //else if(id===1)
    return graph.f != null && graph.f.shape === 'end';
}
function disconnectEnd4(graph){
    //if(id===0)
    return graph.t.t != null && graph.t.t.shape === 'end';
    //else if(id===1)
    //    return graph.t.f != null && graph.t.f.shape === 'end';
}
function disconnectEnd5(graph){
    //if(id===0)
    return graph.f.t != null && graph.f.t.shape === 'end';
    //else if(id===1)
    //    return graph.f.f != null && graph.f.f.shape === 'end';
}
function disconnectEnd6(graph,flag){
    if (disconnectEnd3(graph,1)) {
        if (disconnectEnd5(graph)) {
            graph.f = graph.f.t;
            flag=true;
        }
        //if (disconnectEnd5(graph,1)) {
        //    graph.f = graph.f.f;
        //    flag=true;
        //}
    }
    return flag;
}
function disconnectEnd7(graph){
    if (graph.t!=null&&graph.id<=graph.t.id)
        disconnectEnd(graph.t);
    disconnectEnd(graph.f);
}

function che(name,arr){
    for (let i = 0; i < arr.length; i++)
        if (arr[i]===name)
            return true;
    return false;
}
function end(i){
    let index=i+1;
    let count=0;

    while(stackN[index].shape!='end'||count!=0)
    {
        if(che(stackN[index].shape , ['if','else if','else','while','function']))
            count++;
        else if(stackN[index].shape==='end')
            count--;
        index++;
    }
    return index;
}
function endIf(i){
    let cur=stackN[i];
    while(cur.shape!='end')
    {
        cur=cur.f;
    }
    return cur;
}

let whileSet=[];
function makeGraph(graph,valid){
    if(graph==null)
        return;
    if (che(graph.shape , ['if','else if']))
        makeGraph2(graph,valid);
    else if(graph.shape==='while') {
        if(graph.id in whileSet)
            return;
        makeGraph3(graph, valid);
    }
    else
        makeGraph4(graph,valid);
}
function makeGraph2(graph,valid){
    if (valid===false)    {
        makeGraph(graph.t,false);
        makeGraph(graph.f,false);
    }
    else    {
        if (graph.mainRoad===true)
        {
            makeGraph(graph.t,true);
            makeGraph(graph.f,false);
        }
        else
        {
            makeGraph(graph.t,false);
            makeGraph(graph.f,true);
        }
        graph.mainRoad=true;
    }
}
function makeGraph3(graph,valid){
    whileSet.push(graph.id);
    if (valid===false){
        makeGraph(graph.t,false);
        makeGraph(graph.f,false);
    }
    else{
        if (graph.mainRoad===true){
            makeGraph(graph.t,true);
            makeGraph(graph.f,false);
        }
        else{
            makeGraph(graph.t,false);
            makeGraph(graph.f,true);
        }
        graph.mainRoad=true;
    }
}
function makeGraph4(graph,valid){
    graph.f=null;//cancle else false leg
    if (valid)
        graph.mainRoad=valid;
    makeGraph(graph.t,valid);
}

function draw(){
    let s='\n';
    for (let i = 1; i < stackN.length; i++)
    {
        if (draw2(i))
            continue;
        let id=stackN[i].id;
        let text=stackN[i].text;
        s=s+'n'+id+'[label="'+ text+'"];'+'\n';
        if(stackN[i].t!=null)
        {
            if(che(stackN[i].shape,['while','if','else if']))
                s=s+'n'+id+'->'+'n'+stackN[i].t.id+'[label="T"]\n';
            else
                s=s+'n'+id+'->'+'n'+stackN[i].t.id+'\n';
        }
        s=draw3(i,s,id);
    }
    return s;
}
function draw2(i){
    return stackN[i].shape==='else'||(stackN[i].shape==='end'&&stackN[i].t!=null&&stackN[i].t.shape==='end');
}
function draw3(i,s,id){
    if(stackN[i].f!=null)
        s=s+'n'+id+'->'+'n'+stackN[i].f.id+'[label="F"]\n';
    if(stackN[i].mainRoad===true)
        s=s+'n'+id+'[style="filled",color="Green"];'+'\n';

    if(che(stackN[i].shape,['while','if','else if']))
        s=s+'n'+id+'[shape=diamond];'+'\n';
    else if (stackN[i].shape==='end')
        ;
    else
        s=s+'n'+id+'[shape=square];'+'\n';
    return s;
}


export {convert3,Graph,stackN,manageGraph,connectGraph1,connectGraph2,makeGraph,disconnectEnd,draw};