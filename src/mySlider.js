Element.prototype.slider = function (options) {

    var data = [];
    var warning;
    var values;
    var center;
    var blank;

    var units = [];
    var activeUnit;
    var drag = false;

    var canvas;
    var context;

    initDOM(this);

    initListeners();

    function initDOM(t) {

        var dataInit = document.createElement('div');
        dataInit.className = 'data';

        data[0] = document.createElement('input');
        data[0].className = 'name'
        data[0].setAttribute('type', 'text');
        data[0].setAttribute('placeholder', 'name');
        data[1] = document.createElement('input');
        data[1].className = 'min'
        data[1].setAttribute('type', 'number');
        data[1].setAttribute('placeholder', 'min');
        data[2] = document.createElement('input');
        data[2].className = 'max'
        data[2].setAttribute('type', 'number');
        data[2].setAttribute('placeholder', 'max');
        data[3] = document.createElement('input');
        data[3].className = 'step'
        data[3].setAttribute('type', 'number');
        data[3].setAttribute('placeholder', 'step');

        var button = document.createElement('button');
        button.textContent = 'Add';
        button.addEventListener('click', addOnClick);

        warning = document.createElement('span');
        warning.className = 'warning';

        dataInit.appendChild(data[0]);
        dataInit.appendChild(data[1]);
        dataInit.appendChild(data[2]);
        dataInit.appendChild(data[3]);
        dataInit.appendChild(button);
        dataInit.appendChild(warning);

        values = document.createElement('div')
        values.className = 'values';

        center = document.createElement('div');
        center.className = 'center';

        canvas = document.createElement('canvas');
        canvas.className = 'canvas';
        context = canvas.getContext('2d');
        canvas.width = 284;
        canvas.height = 284;

        blank = document.createElement('div');
        blank.className = 'blank';

        center.appendChild(canvas);
        center.appendChild(blank);

        t.appendChild(dataInit);
        t.appendChild(values);
        t.appendChild(center);
    }

    function initListeners() {

        document.body.addEventListener('mousemove', function (e) {
            move(e.clientX, e.clientY);
        });
        document.body.addEventListener('touchmove', function (e) {
            move(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        });

        document.body.addEventListener('mouseup', end);
        document.body.addEventListener('touchstop', end);

        function move(x, y) {
            if (drag) {
                var rad = getAngle(activeUnit.html.slider, x, y);
                var angle = radToDeg(rad);
                activeUnit.html.knob.style.transform = "rotate(" + angle + "deg)";
                activeUnit.html.label.textContent = '$' + getValue(angle) + ' ' + activeUnit.name;
                activeUnit.draw.rad = rad;
                draw();
            }
        }

        function end() {
            drag = false;
        }
    }

    function applyOptions(options) {

        if (options.init) {
            options.init.forEach(s => {
                if (s.name !== null, s.min !== null, s.max !== null, s.step !== null)
                    addSlider(s.name, s.min, s.max, s.step);
                else
                    console.log('Slider ' + s.name + ' could not be added - one or more of name, min, max or step is improperly defined.');
            });
        }
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
        var min = activeUnit.min,
            max = activeUnit.max,
            step = activeUnit.step,
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
            k = Math.floor(val / step),
            out = 0;

        flag < 0.5 ?
            out = k * step :
            out = (k + 1) * step;
        return out;
    }

    // add slider
    function addOnClick() {

        if (data[0].value === '' || data[1].value === '' || data[2].value === '' || data[3].value === '') {
            warning.textContent = 'All fields required';
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
        addSlider(data[0].value, data[1].value, data[2].value, data[3].value);
    }

    var factor = 6;

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

        blank.style.width = (50 * factor - 1) + 'px';
        blank.style.height = (50 * factor - 1) + 'px';

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

        values.appendChild(unit.html.label);
        center.appendChild(unit.html.slider);
        center.appendChild(unit.html.border);

        data.forEach(input => {
            input.value = "";
        });

        initSliderListeners(unit);
        units.push(unit);
    }

    function initSliderListeners(unit) {

        unit.html.slider.addEventListener('mousedown', function (e) {
            start(e.clientX, e.clientY);
        });
        unit.html.slider.addEventListener('touchstart', function (e) {
            start(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
        });

        function start(x, y) {
            activeUnit = unit;
            activeUnit.draw.rad = getAngle(unit.html.slider, x, y);
            var angle = radToDeg(activeUnit.draw.rad);
            activeUnit.html.knob.style.transform = "rotate(" + angle + "deg)";
            activeUnit.html.label.textContent = '$' + getValue(angle) + ' ' + activeUnit.name;
            activeUnit.html.slider = unit.html.slider;
            drag = true;
            draw();
        }
    }

    //data
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

    applyOptions(options);
};