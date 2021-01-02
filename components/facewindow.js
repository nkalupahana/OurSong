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

    let width = app.resolution.width;
    let height = app.resolution.height;

    while (((width / divisor) > widthLimit) || ((height / divisor) > heightLimit)) {
        divisor += 0.1;
    }

    width = width / divisor;
    height = height / divisor;

    let frame = new Konva.Rect({
        x: 0,
        y: 0,
        width: width,
        height: height,
        stroke: 'black',
        strokeWidth: 4,
        draggable: true,
        dragBoundFunc: pos => {
            let x = pos.x;
            let y = pos.y;
            if (x < 0) x = 0;
            if (y < 0) y = 0;
            if (x > (widthLimit - frame.attrs.width)) x = (widthLimit - frame.attrs.width);
            if (y > (heightLimit - frame.attrs.height)) y = (heightLimit - frame.attrs.height);

            return {x,y};
        }
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
            return newBox;
        }
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
    props: ["vid"],
    template: `<div ref="container"></div>`,
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
        this.stage.clear();
        prepareStage(this, divisor);
    }
});