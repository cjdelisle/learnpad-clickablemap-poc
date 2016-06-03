var parsePosition = function (pos) {
    var xywh = {};
    pos.split(' ').forEach(function (x) {
        x.replace(/^([xywh]):([0-9\.]+)cm$/, function (all, _xywh, num) {
            xywh[_xywh] = Number(num);
        });
    });
    if (!xywh.h && !xywh.w) {
        xywh.h = 2;
        xywh.w = 2;
    }
    if (!xywh.x || !xywh.y || !xywh.w || !xywh.h) {
        throw new Error("failed to parse " + pos);
    }
    return xywh;
};

var getWidthHeightMultiplier = function (xml, modelNum, imageDiv) {
    var area = $(xml).find('MODEL[id="mod.' + modelNum + '"] ATTRIBUTE[name="World area"]').text();
    if (!area) { throw new Error("Failed to get 'World area'"); }
    var wh = {};
    area.split(' ').forEach(function (x) {
        x.replace(/^([wh]):([0-9\.]+)cm$/, function (all, _wh, num) { wh[_wh] = Number(num); });
    });
    if (!wh.w || !wh.h) { throw new Error("failed to parse " + area); }

    console.log("w:" + imageDiv.children().width());
    console.log("h:" + imageDiv.children().height());

    console.log("nw:" + imageDiv.children()[0].naturalWidth);
    console.log("nh:" + imageDiv.children()[0].naturalHeight);

    return {
        widthPixPerCm: imageDiv.children().width() / wh.w,
        heightPixPerCm: imageDiv.children().height() / wh.h
    };
};

var handleXML = function (xml, modelNum, imageDiv) {
    // Grab the model overall dimensions
    //mod.30048
    var whm = getWidthHeightMultiplier(xml, modelNum, imageDiv);
    console.log(whm);

    $(xml).find('MODEL[id="mod.' + modelNum + '"] INSTANCE').each(function (i, el) {
    if (['Pool','Lane'].indexOf($(el).attr('class')) > -1) { return; }
        var pos = parsePosition($(el).find('ATTRIBUTE[name="Position"]').text());

        var posX = pos.x - (pos.w / 2);
        var posY = pos.y - (pos.h / 2);
        $(imageDiv).append(
            '<a href="#" ' +
                'title="' + $(el).attr('name') + '"' +
                'class="learnpad-clickable-map" ' +
                'style="' +
                    'left:' + ( posX * whm.widthPixPerCm) + 'px;' +
                    'top:' + ( posY * whm.heightPixPerCm) + 'px;' +
                    'width:' + (pos.w * whm.widthPixPerCm) + 'px;' +
                    'height:' + (pos.h * whm.heightPixPerCm) + 'px;">' +
            '</a>'
        );
    });
};

$(function () {
    // This is the model number, try also 30048 and 30278
    var obj = "30198";

    var id = 'learnpad-imgmap-' + obj;
    $('body').html(
        '<div style="position:relative;border:0px;margin:0px" id="' + id + '">' +
            '<img src="' + obj + '.png">' +
        '</div>');
    var imageDiv = $('#'+id);

    console.log('...');
    $.ajax("/adoxx_modelset.xml", { dataType: "xml" }).success(function (xml) {
        handleXML(xml, obj, imageDiv);
    }).error(function (x, y, z) {
        throw new Error(z);
    });
});
