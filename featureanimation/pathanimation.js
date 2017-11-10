/* eslint-disable */
/*
	Copyright (c) 2016 Jean-Marc VIGLINO, 
	released under the CeCILL license (http://www.cecill.info/).
	
*/

/** Path animation: feature follow a path
* @param {ol.featureAnimationPathOptions} options
*/
ol.featureAnimation.Path = function(options)
{	options = options || {};
	ol.featureAnimation.call(this, options);
	this.speed_ = options.speed || 0;
	this.path_ = options.path;
    this.baseRotation_ = options.baseRotation || 0
    this.adjustRotation_ = options.adjustRotation || false
	if (this.path_ && this.path_.getGeometry) this.path_ = this.path_.getGeometry();
	if (this.path_ && this.path_.getLineString) this.path_ = this.path_.getLineString();
	if (this.path_.getLength)
	{	this.dist_ = this.path_.getLength()
		if (this.path_ && this.path_.getCoordinates) this.path_ = this.path_.getCoordinates();
	}
	else this.dist_ = 0;
	if (this.speed_>0) this.duration_ = this.dist_/this.speed_;
}
ol.inherits(ol.featureAnimation.Path, ol.featureAnimation);

/** Animate
* @param {ol.featureAnimationEvent} e
*/
ol.featureAnimation.Path.prototype.animate = function (e)
{	// First time 
	if (!e.time) 
	{	if (!this.dist_) return false;
	}
	var dmax = this.dist_*this.easing_(e.elapsed);
	var p0, p, dx,dy, dl, d = 0;
	p = this.path_[0];
	// Linear interpol
	for (var i = 1; i<this.path_.length; i++)
	{	p0 = p;
		p = this.path_[i];
		dx = p[0]-p0[0];
		dy = p[1]-p0[1];
		dl = Math.sqrt(dx*dx+dy*dy);
		if (dl && d+dl>=dmax) 
		{	var s = (dmax-d)/dl;
			p = [ p0[0] + (p[0]-p0[0])*s, p0[1] + (p[1]-p0[1])*s];
			break;
		}
		d += dl;
	}

    if (this.adjustRotation_) {
        var style = e.style

        for (var i = 0; i < style.length; i++) {
            if (style[i].getImage()) {
                var startPoint = e.geom.getCoordinates()
                var endPoint = p
                var angle = -Math.atan2(endPoint[1] - startPoint[1], endPoint[0] - startPoint[0]) + this.baseRotation_

                if (startPoint.join(' ') !== endPoint.join(' ')) {
                    e.style[i].getImage().setRotation(angle)
                }
            }
        }
    }

	e.geom.setCoordinates(p);
	// Animate
	this.drawGeom_(e, e.geom);
	
	return (e.time <= this.duration_);
}
