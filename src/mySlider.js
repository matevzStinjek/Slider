Element.prototype.slider = function (options) {

    var data = [];
    var warning;
    var values;
    var center;
    var blank;

    var units = [];
    var activeUnit;
    var drag = false;

    var svg;
    var canvas;
    var context;

    function initDOM(t) {

        var dataInit = document.createElement('div');
        dataInit.className = 'data';

        data[0] = document.createElement('input');
        data[0].setAttribute('type', 'text');
        data[0].setAttribute('placeholder', 'name');
        data[0].setAttribute('value', 'Health care');
        data[1] = document.createElement('input');
        data[1].setAttribute('type', 'number');
        data[1].setAttribute('placeholder', 'min');
        data[1].setAttribute('value', '0');
        data[2] = document.createElement('input');
        data[2].setAttribute('type', 'number');
        data[2].setAttribute('placeholder', 'max');
        data[2].setAttribute('value', '1000');
        data[3] = document.createElement('input');
        data[3].setAttribute('type', 'number');
        data[3].setAttribute('placeholder', 'step');
        data[3].setAttribute('value', '1');
        data[4] = document.createElement('input');
        data[4].setAttribute('type', 'number');
        data[4].setAttribute('placeholder', 'deg');
        data[5] = document.createElement('input');
        data[5].setAttribute('type', 'color');
        data[5].setAttribute('value', colors.pop());

        var button = document.createElement('button');
        button.textContent = 'Add';
        button.addEventListener('click', addOnClick);

        warning = document.createElement('span');
        warning.className = 'warning';

        dataInit.appendChild(data[0]);
        dataInit.appendChild(data[1]);
        dataInit.appendChild(data[2]);
        dataInit.appendChild(data[3]);
        dataInit.appendChild(data[4]);
        dataInit.appendChild(data[5]);
        dataInit.appendChild(button);
        dataInit.appendChild(warning);

        values = document.createElement('div')
        values.className = 'values';

        center = document.createElement('div');
        center.className = 'center';

        canvas = document.createElement('canvas');
        canvas.className = 'canvas';
        context = canvas.getContext('2d');
        canvas.width = 300;
        canvas.height = 300;

        blank = document.createElement('div');
        blank.className = 'blank';

        svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

        center.appendChild(svg);
        center.appendChild(canvas);
        center.appendChild(blank);

        t.appendChild(dataInit);
        t.appendChild(values);
        t.appendChild(center);

        initListeners();
    }

    function initListeners() {
        document.body.addEventListener('mousemove', function (e) {
            if (drag) {
                move(e.clientX, e.clientY);
                e.preventDefault();
            }
        });
        document.body.addEventListener('touchmove', function (e) {
            if (drag) {
                move(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
                e.preventDefault();
            }
        });
        document.body.addEventListener('mouseup', function () {
            drag = false;
        });
        document.body.addEventListener('touchstop', function () {
            drag = false;
        });
    }

    function move(x, y) {
        activeUnit.draw.rad = getAngle(activeUnit.html.slider, x, y);
        var angle = radToDeg(activeUnit.draw.rad);
        setValue(angle);
    }

    function setValue(angle) {
        activeUnit.html.knob.style.transform = "rotate(" + angle + "deg)";
        activeUnit.html.label.textContent = '$' + getValue(angle); //bug
        draw();
    }

    // drawing
    function draw() {

        context.clearRect(0, 0, canvas.width, canvas.height);
        var width = canvas.width / 2;
        var startAngle = 0 - Math.PI / 2;

        units.forEach(u => {
            context.beginPath();
            context.arc(canvas.width / 2 + 1, canvas.height / 2 + 1, width * u.draw.k, startAngle, u.draw.rad, false);
            context.lineWidth = 17;
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

    function getRelativeClickPos(element, x, y) {
        var rect = element.getBoundingClientRect();
        var x = x - rect.left - rect.width / 2;
        var y = rect.top + rect.height / 2 - y;
        return [x, y];
    }

    function getValue(deg) {
        var out = deg + 90;
        if (out < 0) out += 360;
        return adjustedValue(out);
    }

    function adjustedValue(deg) {
        var min = activeUnit.min,
            max = activeUnit.max,
            step = activeUnit.step,
            delta = max - min,
            val = deg * delta / 360;
        val += parseInt(min);
        return roundToStep(val, step);
    }

    function roundToStep(val, step) {
        var flag = (val / step) % 1,
            k = Math.floor(val / step),
            out = 0;
        flag < 0.5 ?
            out = k * step :
            out = (k + 1) * step;
        return Math.round(out * 10000) / 10000;
    }

    function radToDeg(rad) {
        return rad * (180 / Math.PI);
    }

    function degToRad(deg) {
        return deg * Math.PI / 180;
    }

    // add slider function
    function addOnClick() {

        if (data[0].value === '' || data[1].value === '' || data[2].value === '' || data[3].value === '') {
            warning.textContent = 'Name, min, max and step required';
            return;
        }

        if (parseInt(data[1].value) >= parseInt(data[2].value)) {
            warning.textContent = 'Min has to be smaller than max';
            return;
        }

        if (parseInt(data[3]) > parseInt(data[2]) - parseInt(data[1])) {
            warning.textContent = 'Step has to be smaller than the difference between min and max.';
            return;
        }

        warning.textContent = '';

        var rad = -90;
        if (data[4].value) rad = data[4].value - 90;

        var color = data[5].value ? data[5].value : colors.pop();

        addSlider(data[0].value, data[1].value, data[2].value, data[3].value, rad, color);

        for (var i = 0; i < 5; i++)
            data[i].value = '';
        data[5].value = colors.pop();
    }

    function applyOptions(options) {

        if (options.init) {
            options.init.forEach(s => {
                if (s.name !== null, s.min !== null, s.max !== null, s.step !== null) {
                    if (!s.radius) s.radius = 0;
                    if (!s.color) s.color = colors.pop();
                    addSlider(s.name, s.min, s.max, s.step, s.radius - 90, s.color);
                } else
                    console.log('Slider ' + s.name + ' could not be added - one or more of name, min, max or step is improperly defined.');
            });
        }
    }

    // add slider
    var factor = 6;

    function addSlider(name, min, max, step, radius, color) {

        if (--factor === 0) return;

        var labelNode = document.createElement('div'),
            value = document.createElement('h1'),
            colorBox = document.createElement('span'),
            nameTag = document.createElement('p');
            colorBox.style.backgroundColor = color;
        nameTag.textContent = name;
        labelNode.appendChild(value);
        labelNode.appendChild(colorBox);
        labelNode.appendChild(nameTag);

        var sliderNode = document.createElement('div'),
            sliderSpan = document.createElement('span');
        sliderNode.className = 'default-slider';
        sliderNode.style.width = (50 * factor) + 'px';
        sliderNode.style.height = (50 * factor) + 'px';
        sliderSpan.className = 'angle-input-knob'
        sliderNode.appendChild(sliderSpan);

        var circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttributeNS(null, "stroke-width", 17);
        circle.setAttributeNS(null, "fill-opacity", 0);
        circle.setAttributeNS(null, "r", svgRad.pop());
        circle.setAttributeNS(null, "cx", 150);
        circle.setAttributeNS(null, "cy", 150);
        circle.setAttributeNS(null, "stroke", 'lightgray');
        circle.setAttributeNS(null, "stroke-opacity", 0.8);
        circle.setAttributeNS(null, "stroke-dasharray", '4, 1');
        svg.appendChild(circle);

        blank.style.width = (50 * factor - 1) + 'px';
        blank.style.height = (50 * factor - 1) + 'px';

        var unit = ({
            name: name,
            min: min,
            max: max,
            step: step,
            html: {
                label: value,
                slider: sliderNode,
                knob: sliderSpan,
            },
            draw: {
                color: color,
                rad: degToRad(radius),
                k: factors.pop()
            }
        });

        values.appendChild(labelNode);
        center.appendChild(sliderNode);

        initSliderListeners(unit);
        activeUnit = unit;
        units.push(unit);
        setValue(radius);
    }

    function initSliderListeners(unit) {

        unit.html.slider.addEventListener('mousedown', function (e) {
            activeUnit = unit;
            drag = true;
            move(e.clientX, e.clientY);
        });
        unit.html.slider.addEventListener('touchstart', function (e) {
            activeUnit = unit;
            drag = true;
            move(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        });
    }

    // data
    var colors = [
        '#000000',
        '#FB8C00',
        '#43A047',
        '#1E88E5',
        '#6A1B9A',
        '#F44336',
    ];

    var factors = [
        0.228,
        0.393,
        0.560,
        0.727,
        0.894
    ];

    var svgRad = [
        34,
        59,
        84,
        109,
        134
    ]

    // start
    initDOM(this);
    applyOptions(options);
};