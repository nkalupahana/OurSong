function getDivisor(obj) {
    let divisor = 1;
    let widthLimit = window.innerWidth - 400;
    let heightLimit = window.innerHeight - 400;
    let width = app.videos[obj.vid].width;
    let height = app.videos[obj.vid].height;

    while (((width / divisor) > widthLimit) || ((height / divisor) > heightLimit)) {
        divisor += 0.25;
    }

    return divisor;
}

function prepareStage(obj, divisor) {
    let layer = new Konva.Layer();
    obj.stage.add(layer);

    const widthLimit = obj.stage.width();
    const heightLimit = obj.stage.height();
    const ratio = app.windowRatios()[obj.ratio];

    let width;
    let height;
    let x = 0;
    let y = 0;

    if (!app.videos[app.currentVideo].layouts[ratio]) {
        width = app.resolution.width * (ratio > 1 ? ratio : 1);
        height = app.resolution.height / (ratio < 1 ? ratio : 1);
    
        while (((width / divisor) > widthLimit) || ((height / divisor) > heightLimit)) {
            divisor += 0.1;
        }

        width = width / divisor;
        height = height / divisor;
    } else {
        const tobj = app.videos[app.currentVideo].layouts[ratio];
        width = tobj.width * widthLimit;
        height = tobj.height * heightLimit;
        x = tobj.x * widthLimit;
        y = tobj.y * heightLimit;
    }

    let frame = new Konva.Rect({
        x,
        y,
        width,
        height,
        stroke: 'black',
        strokeWidth: 4,
        draggable: true,
        dragBoundFunc: pos => {
            let x = pos.x;
            let y = pos.y;
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x > (widthLimit - (frame.attrs.width * frame.attrs.scaleX))) x = (widthLimit - (frame.attrs.width * frame.attrs.scaleX));
            if (y > (heightLimit - (frame.attrs.height * frame.attrs.scaleY))) y = (heightLimit - (frame.attrs.height * frame.attrs.scaleY));

            return {x,y};
        }
    });

    frame.on("dragend", e => {
        syncWindowToVue(frame, obj.stage);
    });

    layer.add(frame);

    // create new transformer
    let tr = new Konva.Transformer({
        anchorStroke: 'red',
        anchorFill: 'red',
        anchorSize: 10,
        rotateEnabled: false,
        keepRatio: true,
        enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        nodes: [frame],
        boundBoxFunc: (oldBox, newBox) => {
            if (newBox.height > heightLimit) return oldBox;
            if (newBox.width > widthLimit) return oldBox;
            return newBox;
        }
    });

    tr.on("transformend", () => {
        syncWindowToVue(frame, obj.stage);
    });

    layer.add(tr);
    layer.draw();
}

function addImage(obj, divisor) {
    let layer = new Konva.Layer();
    obj.stage.add(layer);
    
    Konva.Image.fromURL(app.thumbnail(app.videos[obj.vid]), node => {
        node.setAttrs({
            x: 0,
            y: 0,
            scaleX: 1 / divisor,
            scaleY: 1 / divisor,
        });

        layer.add(node);
        layer.batchDraw();
    });
}

Vue.component('facewindow', {
    props: ["vid", "ratio"],
    template: `<div :ratio="ratio" :vid="vid" ref="container"></div>`,
    mounted () {
        const divisor = getDivisor(this);
        this.stage = new Konva.Stage({
            container: this.$refs.container,
            width: app.videos[this.vid].width / divisor,
            height: app.videos[this.vid].height / divisor,
        });
        addImage(this, divisor);
        prepareStage(this, divisor);
    },
    updated() {
        const divisor = getDivisor(this);
        this.stage.destroy();
        this.stage = new Konva.Stage({
            container: this.$refs.container,
            width: app.videos[this.vid].width / divisor,
            height: app.videos[this.vid].height / divisor,
        });
        addImage(this, divisor);
        prepareStage(this, divisor);
    }
});

function syncWindowToVue(frame, stage) {
    app.videos[app.currentVideo].layouts[app.windowRatios()[app.currentRatio]] = {
        x: frame.attrs.x / stage.width(),
        y: frame.attrs.y / stage.height(),
        width: (frame.attrs.width * frame.attrs.scaleX) / stage.width(),
        height: (frame.attrs.height * frame.attrs.scaleY) / stage.height()
    };

    app.$forceUpdate();
}