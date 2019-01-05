import $ from 'jquery';
import {parseCode} from './code-analyzer';
import {convert1,convert2} from './parser';
import {convert3} from './subtitute';

import Viz from 'viz.js';
import { Module, render } from 'viz.js/full.render.js';



$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        let codeToParse = $('#codePlaceholder').val();
        let parsedCode = parseCode(codeToParse);
        let t=convert1(parsedCode);
        let inner=convert3(codeToParse,document.getElementById('params').value,t);
        //http://viz-js.com/
        //npm install viz.js
        let d='digraph g {'+inner+'}';
        let viz = new Viz({ Module, render });
        viz.renderSVGElement(d)
            .then(function(element) {
                document.body.appendChild(element);
            });

    });
});

