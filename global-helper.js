
window.cancelRequestAnimFrame = ( function(w) {
    return w.cancelAnimationFrame           ||
        w.webkitCancelRequestAnimationFrame ||
        w.mozCancelRequestAnimationFrame    ||
        w.oCancelRequestAnimationFrame      ||
        w.msCancelRequestAnimationFrame     ||
        clearTimeout
} )(window);

window.animStartTime = (function(w){
  return  w.animationStartTime       || 
          w.webkitAnimationStartTime || 
          w.mozAnimationStartTime    || 
          w.oAnimationStartTime      || 
          w.msAnimationStartTime     || 
          +new Date();
})(window);

// shim layer with setTimeout fallback
window.requestAnimFrame = (function(w){
  return  w.requestAnimationFrame       || 
          w.webkitRequestAnimationFrame || 
          w.mozRequestAnimationFrame    || 
          w.oRequestAnimationFrame      || 
          w.msRequestAnimationFrame     || 
          function(/* function */ callback, /* DOMElement */ element) {
            return w.setTimeout(function() {
                callback(+new Date());
            }, /*1000/60*/17);
          };
})(window);

window.Glb = {};

/*
 * createUUID is part of Raphaël 2.0.0 - JavaScript Vector Library
 * Copyright (c) 2011 Dmitry Baranovskiy (http://raphaeljs.com)
 * Copyright (c) 2011 Sencha Labs (http://sencha.com)
 * Licensed under the MIT (http://raphaeljs.com/license.html) license.
 */
Glb.createUUID = (function (uuidRegEx, uuidReplacer) {
    return function () {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(uuidRegEx, uuidReplacer).toUpperCase();
    };
})(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0,
        v = c == "x" ? r : (r & 3 | 8);
    return v.toString(16);
});

Glb.point = {
    make : function(x,y) {
       return { x:x, y:y };
    },
    zero : function() {
        return { x:0, y:0 };
    },
    add : function(p1, p2) {
        return this.make(p1.x + p2.x, p1.y + p2.y);
    },
    sub : function(p1, p2) {
    	return this.make(p1.x - p2.x, p1.y - p2.y);
    },
    mult : function(p, s) {
        return this.make(p.x * s, p.y * s);
    },
    dot : function(p1, p2) {
        return p1.x * p2.x + p1.y * p2.y;
    },
    lengthSQ : function(p) {
        return this.dot(p, p);
    },
    length : function(p) {
        return Math.sqrt(this.lengthSQ(p));
    },
    normalize : function(p) {
       return this.mult(p, 1.0 / this.length(p));
    }
};

Glb.size = {
    make : function(w, h) {
        return { width:w, height:h };
    }
};

Glb.color = (function() {
    return {
        makeRGBA : function(r,g,b,a) {
            return { red:r, green:g, blue:b, alpha:a };
        },
        dec : function(p) {
            return ( 255 * p ).toFixed(0);
        },
        css : function(c) {
            return 'rgba('+[this.dec(c.red), this.dec(c.green), this.dec(c.blue), this.dec(c.alpha)].join(',')+')';
        },
        cssAlpha : function(c) {
            //return 'rgba(0,0,0,0)';
            return 'rgba('+[this.dec(c.red), this.dec(c.green), this.dec(c.blue), 0].join(',')+')';
        }
    }
})();

Glb.angle = {
    degreesToRadians : function(v) {
        return v * 0.01745329252;  // PI / 180
    }
};

Glb.console = {
    log : function() {
        //console.log.apply(console, arguments);
    },
    logPrio3 : function() {
        //console.log.apply(console, arguments);
    },
    warning : function() {
        console.info.apply(console, arguments);
    }
};

// returns a random float between -1 and 1
Glb.random = function() {
    return Math.random() * 2 - 1;
};

// CanvasPixelArray helper functions
Glb.pixelArrayHelper = {
    
    row : function(imageData, v) {
        return v * imageData.width * 4;
    },
    column : function(v) {
        return v * 4;
    },
    rowAndColumn : function(imageData, row, column) {
        return this.row(imageData, row) + this.column(column);
    }
};