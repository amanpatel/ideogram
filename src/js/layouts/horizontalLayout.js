
function HorizontalLayout(config, ideo) {
    Layout.call(this, config, ideo);
    this._class = 'HorizontalLayout';
    this._margin = {
        left : 20,
        top : 30
    };
}


HorizontalLayout.prototype = Object.create(Layout.prototype);

HorizontalLayout.prototype._getLeftMargin = function() {

    var margin = Layout.prototype._getLeftMargin.call(this);
    if (this._config.ploidy > 1) {
        margin = margin * 1.8;
    }

    return margin;
};

HorizontalLayout.prototype.rotateForward = function(setNumber, chrNumber, chrElement, callback) {
    /*
     * Stash reference to this object.
     */
    var self = this;

    var xOffset = 30;

    var ideoBox = d3.select("#_ideogram").node().getBoundingClientRect();
    var chrBox = chrElement.getBoundingClientRect();

    var scaleX = (ideoBox.height / (chrBox.width + xOffset / 2)) * 0.9;
    var scaleY = this._getYScale();

    var yOffset = (chrNumber + 1) * ((this._config.chrWidth * 2) * scaleY);

    var transform = 'rotate(90) translate(' + xOffset + ', -' + yOffset + ') scale(' + scaleX + ', ' + scaleY + ')';

    d3.select(chrElement.parentNode)
        .transition()
        .attr("transform", transform)
        .on('end', callback);
    /*
     * Append new chromosome labels.
     */
    var labels = this.getChromosomeLabels(chrElement);
    d3.select(this._ideo.getSvg())
        .append('g')
        .attr('class', 'tmp')
        .selectAll('text')
        .data(labels)
        .enter()
        .append('text')
        .attr('class', function(d, i) {
            return i === 0 && labels.length === 2 ? 'chrSetLabel' : null;
        }).attr('x', function(d, i) {
            return 30;
        }).attr('y', function(d, i) {
            return (i + 1 + labels.length % 2) * 12;
        }).style('text-anchor', 'middle')
        .style('opacity', 0)
        .text(String)
        .transition()
        .style('opacity', 1);
};


HorizontalLayout.prototype.rotateBack = function(setNumber, chrNumber, chrElement, callback) {

    var translate = this.getChromosomeSetTranslate(setNumber);

    d3.select(chrElement.parentNode)
        .transition()
        .attr("transform", translate)
        .on('end', callback);

    d3.selectAll('g.tmp')
        .style('opacity', 0)
        .remove();
};


HorizontalLayout.prototype.getHeight = function(taxId) {

    // Get last chromosome set offset.
    var lastSetOffset = this.getChromosomeSetYTranslate(this._config.chromosomes[taxId].length - 1);

    // Get last chromosome set size.
    var lastSetSize = this._getChromosomeSetSize(this._config.chromosomes[taxId].length - 1);

    // Increase offset by last chromosome set size
    lastSetOffset += lastSetSize;

    return lastSetOffset + this._getAdditionalOffset() * 2;
};


HorizontalLayout.prototype.getChromosomeSetLabelAnchor = function() {
    return 'end';
};


HorizontalLayout.prototype.getChromosomeBandLabelAnchor = function(chrNumber) {
    return null;
};

HorizontalLayout.prototype.getChromosomeBandTickY1 = function(chrNumber) {
    return 2;
};


HorizontalLayout.prototype.getChromosomeBandTickY2 = function(chrNumber) {
    return 10;
};


HorizontalLayout.prototype.getChromosomeBandLabelTranslate = function(band) {

    var x = this._ideo.round(- this._tickSize + band.px.start + band.px.width / 2);
    var y = -10;

    return {
        x : x,
        y : y,
        translate : 'translate(' + x + ',' + y + ')'
    };
};


HorizontalLayout.prototype.getChromosomeSetLabelTranslate = function() {
    return null;
};


HorizontalLayout.prototype.getChromosomeSetTranslate = function(setNumber) {
    return "translate(" + this._getLeftMargin() + ", " + this.getChromosomeSetYTranslate(setNumber) + ")";
};

HorizontalLayout.prototype.getChromosomeSetYTranslate = function(setNumber) {

    // If no detailed description provided just use one formula for all cases.
    if (! this._config.ploidyDesc) {
        return this._config.chrMargin * (setNumber + 1);
    }

    // Id detailed description provided start to calculate offsets
    //  for each chromosome set separately. This should be done only once.
    if (! this._translate) {

        // First offset equals to zero.
        this._translate = [1];

        // Loop through description set
        for (var i = 1; i < this._config.ploidyDesc.length; i ++) {
            this._translate[i] = this._translate[i - 1] + this._getChromosomeSetSize(i - 1);
        }
    }

    return this._translate[setNumber];
};


HorizontalLayout.prototype.getChromosomeSetLabelXPosition = function(i) {
    if (this._config.ploidy === 1) {
        return this.getChromosomeLabelXPosition(i);
    } else {
        return -20;
    }
};


HorizontalLayout.prototype.getChromosomeSetLabelYPosition = function(i) {

    if (this._config.ploidy === 1) {
        return (this._ploidy.getSetSize(i) * this._config.chrWidth) / 2 + 3;
    } else {
        return this._ploidy.getSetSize(i) * this._config.chrWidth;
    }
};


HorizontalLayout.prototype.getChromosomeLabelXPosition = function(i) {
    return -8;
};


HorizontalLayout.prototype.getChromosomeLabelYPosition = function(i) {
    return this._config.chrWidth;
};
