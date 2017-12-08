var data;
var warning;
var valuesHTML;
var centerHTML;
var factor;

var units;
var canvas;
var context;

var drag = false;
var globalUnit;
var globalKnob;
var globalElement;
var globalLabel;

Element.prototype.slider = function (options) {

    initDOM(this);

    initiListeners();

    applyOptions(options);

    function initDOM(s) {
        var dataInit = document.createElement('div');
        dataInit.className = 'data';
    
        var inputNameInit = document.createElement('input');
        inputNameInit.className = 'name'
        inputNameInit.setAttribute('type', 'text');
        inputNameInit.setAttribute('placeholder', 'name');
        var inputMinInit = document.createElement('input');
        inputMinInit.className = 'min'
        inputMinInit.setAttribute('type', 'number');
        inputMinInit.setAttribute('placeholder', 'min');
        var inputMaxInit = document.createElement('input');
        inputMaxInit.className = 'max'
        inputMaxInit.setAttribute('type', 'number');
        inputMaxInit.setAttribute('placeholder', 'max');
        var inputStepInit = document.createElement('input');
        inputStepInit.className = 'step'
        inputStepInit.setAttribute('type', 'number');
        inputStepInit.setAttribute('placeholder', 'step');
    
        var buttonAddInit = document.createElement('button');
        buttonAddInit.textContent = 'Add';
        buttonAddInit.addEventListener('click', addOnClick);
    
        var spanWarningInit = document.createElement('span');
        spanWarningInit.className = 'warning';
    
        dataInit.appendChild(inputNameInit);
        dataInit.appendChild(inputMinInit);
        dataInit.appendChild(inputMaxInit);
        dataInit.appendChild(inputStepInit);
        dataInit.appendChild(buttonAddInit);
        dataInit.appendChild(spanWarningInit);
    
        var valuesInit = document.createElement('div')
        valuesInit.className = 'values';
    
        var centerInit = document.createElement('div');
        centerInit.className = 'center';
    
        var canvasInit = document.createElement('canvas');
        canvasInit.className = 'canvas';
    
        centerInit.appendChild(canvasInit);
    
        s.appendChild(dataInit);
        s.appendChild(valuesInit);
        s.appendChild(centerInit);
    }

    function initiListeners() {
        units = [];
        canvas = document.querySelector('.canvas');
        context = canvas.getContext('2d');
        canvas.width = 284;
        context.canvas.height = 284;
    
        document.body.addEventListener('mousemove', function (e) {
            move(e.clientX, e.clientY);
        });
        document.body.addEventListener('touchmove', function (e) {
            move(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        });
    
        function move(x, y) {
            if (drag) {
                var rad = getAngle(globalElement, x, y);
                var angle = radToDeg(rad);
                globalKnob.style.transform = "rotate(" + angle + "deg)";
                globalLabel.textContent = '$' + getValue(angle) + ' ' + globalUnit.name;
                globalUnit.draw.rad = rad;
                draw();
            }
        }
    
        document.body.addEventListener('mouseup', end);
        document.body.addEventListener('touchstop', end);
    
        function end() {
            drag = false;
        }
    
        data = document.querySelectorAll('.data input');
        warning = document.querySelector('.warning');
        valuesHTML = document.querySelector('.values');
        centerHTML = document.querySelector('.center');
        factor = 6;
    }

    function applyOptions(options) {

        if (options.init) {
            options.init.forEach(s => {
                if (s.name !== null, s.min !== null, s.max !== null, s.step !== null)
                    addSlider(s.name, s.min, s.max, s.step);
                else
                    console.log('Slider could not be added - one or more of name, min, max or step is improperly defined.');
            });
        }
    }
};

function init() {
    units.forEach(unit => {

        unit.html.slider.addEventListener('mousedown', function (e) {
            start(e.clientX, e.clientY);
        });
        unit.html.slider.addEventListener('touchstart', function (e) {
            start(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        });

        function start(x, y) {
            globalUnit = unit;
            var knob = unit.html.slider.querySelector('.angle-input-knob');
            var rad = getAngle(unit.html.slider, x, y)
            var angle = radToDeg(rad);
            knob.style.transform = "rotate(" + angle + "deg)";
            unit.html.label.textContent = '$' + getValue(angle) + ' ' + globalUnit.name;
            drag = true;
            globalKnob = knob;
            globalElement = unit.html.slider;
            globalLabel = unit.html.label;
            globalUnit.draw.rad = rad;
            draw();
        }
    })
}

// drawing
function draw() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    var radius = canvas.width / 2;
    var startAngle = 0 - Math.PI / 2;

    units.forEach(u => {
        context.beginPath();
        context.arc(canvas.width / 2 + 1, canvas.height / 2 + 1, radius * u.draw.radius, startAngle, u.draw.rad, false);
        context.lineWidth = 14;
        context.strokeStyle = u.draw.color;
        context.stroke();
    });
}

// calculations
function getAngle(element, x, y) {
    var pos = getRelativeClickPos(element, x, y);
    var rad = Math.atan2(pos[0], pos[1]);
    rad -= Math.PI / 2;
    return rad;
}

function getValue(deg) {
    var out = deg + 90;
    if (out < 0) out += 360;
    return adjustedValue(out);
}

function getRelativeClickPos(element, x, y) {
    var rect = element.getBoundingClientRect();
    var x = x - rect.left - rect.width / 2;
    var y = rect.top + rect.height / 2 - y;
    return [x, y];
}

function adjustedValue(deg) {
    var min = globalUnit.min,
        max = globalUnit.max,
        step = globalUnit.step,
        delta = max - min,
        val = deg * delta / 360 + min;
    out = roundToStep(val, step);
    return out;
}

function radToDeg(rad) {
    return rad * (180 / Math.PI);
}

function roundToStep(val, step) {
    var flag = (val / step) % 1,
        factor = Math.floor(val / step),
        out = 0;

    flag < 0.5 ?
        out = factor * step :
        out = (factor + 1) * step;
    return out;
}

// add slider
function addOnClick() {

    if (data[0].value === '' || data[1].value === '' || data[2].value === '' || data[3].value === '') {
        warning.textContent = 'All fields required';
        return;
    }

    if (parseInt(data[1].value) >= parseInt(data[2].value)){
        warning.textContent = 'Min has to be smaller than max';
        return;
    }

    if (parseInt(data[3]) > parseInt(data[2]) - parseInt(data[1])){
        warning.textContent = 'Step has to be smaller than the difference between min and max.';
        return;
    }

    warning.textContent = '';
    addSlider(data[0].value, data[1].value, data[2].value, data[3].value);
}

function addSlider(name, min, max, step) {

    factor--;
    if (factor <= 0) return;

    var labelNode = document.createElement('div');
    labelNode.appendChild(document.createTextNode('$0 ' + name));

    var sliderNode = document.createElement('div'),
        sliderSpan = document.createElement('span');
    sliderNode.className = 'default-slider';
    sliderNode.style.width = (50 * factor) + 'px';
    sliderNode.style.height = (50 * factor) + 'px';
    sliderSpan.className = 'angle-input-knob'
    sliderNode.appendChild(sliderSpan);

    var borderNode = document.createElement('div');
    borderNode.className = 'default-slider-border';
    borderNode.style.width = (50 * factor) + 'px';
    borderNode.style.height = (50 * factor) + 'px';


    var unit = ({
        name: name,
        min: min,
        max: max,
        step: step,
        html: {
            label: labelNode,
            slider: sliderNode,
            knob: sliderSpan,
            border: borderNode
        },
        draw: {
            color: colors.pop(),
            rad: 0 - Math.PI / 2,
            radius: factors.pop()
        }
    });

    valuesHTML.appendChild(unit.html.label);
    centerHTML.appendChild(unit.html.slider);
    centerHTML.appendChild(unit.html.border);

    units.push(unit);

    data.forEach(input => {
        input.value = "";
    });

    init();
}

// data
var colors = [
    '#F44336',
    '#FB8C00',
    '#43A047',
    '#1E88E5',
    '#6A1B9A'
];

var factors = [
    0.23,
    0.405,
    0.58,
    0.758,
    0.935
];