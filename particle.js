/**
 * Particle Class v0.0.1
 * http://basecode.appspot.com/particles.html
 * Copyright 2011, Tobias Reiss, @basecode
 * Licensed under the MIT license.
 * Date: Jun 17 2011
 */

;(function(w, undefined) {
    
    "use strict";
    
    //- mark Particle constructor
    var P = function(aParticleSystem) {
        
        if (!aParticleSystem) {
            return this;
        }
        
        // internal
        this.ps = aParticleSystem;
        this.id = Glb.createUUID();
    
        this.timeToLive = 0;
        this.startPosition = Glb.point.zero();
        this.lastDelta = 0;
        this.deltaCounter = 0;
        
        this.position                = Glb.point.zero();
        this.color                   = null;
        this.deltaColor              = null;
        this.size                    = null;
        this.deltaSize               = null;
        this.rotation                = null;
        this.deltaRotation           = null;
        this.direction               = null;
        this.radialAcceleration      = null;
        this.tangentialAcceleration  = null;
    
        this.init();
    };
    
    P.prototype.id = null;
    
    P.prototype.init = function() {
        
        //Glb.console.log("[%s] initialised", this.id);
        
        var c = this.ps._config;
        
        // timeToLive
        // prevent division by 0
        this.timeToLive = Math.max( 0, c.lifespan + c.lifespanVariance * Glb.random() );
       
        // position
        this.position.x = c.position.x + c.positionVariance.x * Glb.random();
        this.position.y = c.position.y + c.positionVariance.y * Glb.random();
        this.startPosition = this.position;
        
        // set composite operation
        this.ps.context.globalCompositeOperation = c.globalComposite;
        
        // angle
        var newAngle = Glb.angle.degreesToRadians( 360 - c.angle + c.angleVariance * Glb.random() );	
        
        // color
        
        var startColor = Glb.color.makeRGBA(
           Math.min(1, Math.max(0, c.startColor.red + c.startColorVariance.red * Glb.random()) ),
           Math.min(1, Math.max(0, c.startColor.green + c.startColorVariance.green * Glb.random()) ),
           Math.min(1, Math.max(0, c.startColor.blue + c.startColorVariance.blue * Glb.random()) ),
           Math.min(1, Math.max(0, c.startColor.alpha + c.startColorVariance.alpha * Glb.random()) )
        );
        
        var endColor = Glb.color.makeRGBA(
           Math.min(1, Math.max(0, c.endColor.red + c.endColorVariance.red * Glb.random()) ),
           Math.min(1, Math.max(0, c.endColor.green + c.endColorVariance.green * Glb.random()) ),
           Math.min(1, Math.max(0, c.endColor.blue + c.endColorVariance.blue * Glb.random()) ),
           Math.min(1, Math.max(0, c.endColor.alpha + c.endColorVariance.alpha * Glb.random()) )
        );
        
        this.color = startColor;
        
        this.deltaColor = Glb.color.makeRGBA(
           (endColor.red - startColor.red) / this.timeToLive,
           (endColor.green - startColor.green) / this.timeToLive,
           (endColor.blue - startColor.blue) / this.timeToLive,
           (endColor.alpha - startColor.alpha) / this.timeToLive
        );
        
        // size
        var startSize = Math.max(0, c.startSize + c.startSizeVariance * Glb.random());
        var endSize   = Math.max(0, c.endSize + c.endSizeVariance * Glb.random());
        
        this.size = startSize;
        this.deltaSize = (endSize - startSize) / this.timeToLive;
    
        // mode: gravity
        //if( this.ps._config['emitterMode'] === "GRAVITY" ) {
    
        var vector = Glb.point.make(Math.cos(newAngle), Math.sin(newAngle));
        var vectorSpeed = c.speed + c.speedVariance * Glb.random();
        
        // direction
        this.direction = Glb.point.mult(vector, vectorSpeed);
        
        // radial accel
        this.radialAcceleration = c.radialAcceleration + c.radialAccelerationVariance * Glb.random();
        
        // tangential accel
        this.tangentialAcceleration = c.tangentialAcceleration + c.tangentialAccelerationVariance * Glb.random();
        
        //}
    };
    
    P.prototype.isAlive = function(t) {
        return this.timeToLive > 0;
    };
    
    P.prototype.die = function() {
        this.timeToLive = 0;
    };
    
    P.prototype.reset = function() {
        this.init();
    };
    
    P.prototype.draw = function(delta) {
        
        var dt = delta/1000;
        var tmp, radial, tangential, gravity, diff;
        
        //dt = 0.05;

        this.timeToLive -= dt;
        
        //if( this.ps._config['emitterMode'] === "GRAVITY" ) {
            
        radial = Glb.point.zero();
        diff = Glb.point.sub(this.startPosition, Glb.point.zero());
        this.position = Glb.point.sub(this.position, diff);

        if (this.position.x || this.position.y) {
            radial = Glb.point.normalize(this.position);
        }

        // radial acceleration
        tangential = radial;
        radial = Glb.point.mult(radial, this.radialAcceleration);
        gravity = Glb.point.make(this.ps._config['gravity'].x, -1*this.ps._config['gravity'].y);

        // tangential acceleration
        tangential = Glb.point.mult(Glb.point.make(-tangential.y, tangential.x), -1*this.tangentialAcceleration);
        
        // (gravity + radial + tangential) * dt
        tmp = Glb.point.add( Glb.point.add(radial, tangential), gravity);
        tmp = Glb.point.mult(tmp, dt);
        this.direction = Glb.point.add(this.direction, tmp);
        tmp = Glb.point.mult(this.direction, dt);
        this.position = Glb.point.add(this.position, tmp);
        this.position = Glb.point.add(this.position, diff);
    
        //}
        
        // color
        this.color.red += (this.deltaColor.red * dt);
        this.color.green += (this.deltaColor.green * dt);
        this.color.blue += (this.deltaColor.blue * dt);
        this.color.alpha += (this.deltaColor.alpha * dt);
        
        // size
        this.size += (this.deltaSize * dt);
        this.size = Math.max( 0, this.size );
        
        // angle
        this.rotation += (this.deltaRotation * dt);
    
    };

    w.Particle = P;

})(window);


// particle subclass: bubble

;(function(w, undefined) {

    var P = function(aParticleSystem) {
        this.constructor(aParticleSystem);
        this.colorStop = [0.0, '#FFF', 1, 'rgba(0,0,0,0)'];
    };
    
    P.prototype = new Particle();
    
    P.prototype.draw = function(delta) {
        
        Particle.prototype.draw.call(this, delta);
        
        // break when particle is not visible
        if (this.size < 1 || this.position.x < this.size || this.position.y < this.size) {
            return;
        }
        
        var x = this.position.x;
        var y = this.position.y;
        var s = this.size;
        var c = this.color;
    
        var gradient = this.ps.context.createRadialGradient(x, y, 0, x, y, s);
        gradient.addColorStop(0, Glb.color.css(c));
        gradient.addColorStop(1, Glb.color.cssAlpha(c));
    
        this.ps.context.save();
        this.ps.context.fillStyle = gradient;
        this.ps.context.beginPath();
        this.ps.context.arc(x, y, s, 0, Math.PI * 2, true);
        this.ps.context.fill();
        this.ps.context.restore();
    };

    w.ParticleBubble = P;

})(window);


// particle subclass: sun

;(function(w, undefined) {

    var P = function(aParticleSystem) {
        this.constructor(aParticleSystem);
    };
    
    P.prototype = new Particle();
    
    P.prototype.draw = function(delta) {
        
        Particle.prototype.draw.call(this, delta);
        
        // break when particle is not visible
        if (this.size < 1 || this.position.x < this.size || this.position.y < this.size) {
            return;
        }
        
        var x = this.position.x;
        var y = this.position.y;
        var s = this.size;
        var c = this.color;
    
        var gradient = this.ps.context.createRadialGradient(x, y, 0, x, y, s);
        gradient.addColorStop(0.8, Glb.color.css(c));
        gradient.addColorStop(1, Glb.color.cssAlpha(c));
    
        this.ps.context.save();
        this.ps.context.fillStyle = gradient;
        this.ps.context.beginPath();
        this.ps.context.arc(x, y, s, 0, Math.PI * 2, true);
        this.ps.context.fill();
        this.ps.context.restore();
    };

    w.ParticleSun = P;

})(window);


// particle subclass: star

;(function(w, undefined) {

    var P = function(aParticleSystem) {
        this.constructor(aParticleSystem);
    };
    
    P.prototype = new Particle();
    
    P.prototype.draw = function(delta) {
        
        Particle.prototype.draw.call(this, delta);
        
        // break when particle is not visible
        if (this.size < 1 || this.position.x < this.size || this.position.y < this.size) {
            return;
        }
        
        var x = this.position.x;
        var y = this.position.y;
        var s = this.size;
        var c = this.color;
    
        this.ps.context.fillStyle = Glb.color.css(c);
        
        this.ps.context.save();
        this.ps.context.translate(x,y);
        this.ps.context.scale(s/50, s/50);
        this.ps.context.beginPath();
        this.ps.context.moveTo(-26,-5.5);
        this.ps.context.lineTo(-7.5,-7.5);
        this.ps.context.lineTo(-1.5,-26);
        this.ps.context.lineTo(5.6, -9);
        this.ps.context.lineTo(25,-10);
        this.ps.context.lineTo(10,3.5);
        this.ps.context.lineTo(17,22);
        this.ps.context.lineTo(0.5, 12);
        this.ps.context.lineTo(-14, 24);
        this.ps.context.lineTo(-10.5, 4.5);
        this.ps.context.closePath();
        this.ps.context.fill();
        this.ps.context.restore();
    };

    w.ParticleStar = P;

})(window);


// particle subclass: star-image

;(function(w, undefined) {

    var P = function(aParticleSystem) {
    
        this.constructor(aParticleSystem);
        
        this.image = new Image();
        // @? onload
        this.image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAQAAAAAYLlVAAAFJElEQVRo3sWZXYgVZRjHn3N2N8SKXUu8CLYPhS0xacEUgj6wLioikS4sNmgLEoJKNwiyvKjsIjHELurGJBDTuiqMQBJFkQJrvUrM8qKkYsOsldzaXdqd/6+LmXfmfefMLufMOZ4z+3VmZ+Z9/8//+T8f77xm8xxawWdUzGQdO/iHs1zXCgjk/tb5CPtAE7rDjGr5yZVMS3/DozAkhOCxBtHX2E6FD3mn8Yf7hQDB62UgpMSv40/QioZHoEtjgDQjtDu2pGHbr+ZzAJ0rxaEOAiAhdEJXmVHXME62vKRZYg6fLAfgTUCS0IzQbyyqZ5jE9mUaBYkIuMz1peTD/QIhxSgg4l4zzROYqd93JeqJZfRR2fitKlKEBAmTwEYzqiqkXVUzMz3Ixex+zQJ3lnOAmennWAPJcDGE7b6fc8T36WNHmtMPF8zoKcvBTsdixoLgYBwT8rgyM+M5ZhXLhuRLoJfNVCkL4AElDCQAkBQJvlGvU0NsuwZ0PFasFECOuLmZLH4TyPtKziLgbwbMqNBlRrfeJrQ8sV9wuLky0sMZvOnxhpZ42MxM93FeKMqBRDADWlc2jTsp7kssi4lNPyWh8SK7E9uVAssASONmdDVRyczYlFCuNLRcWEJs9WwMEZRec1JkZ5P2m+lWoZkMgFwk4IGSIz4TbHJpdZOthLrNmE4Z8GKLQJ1yqJS4Kf70Q/lC7gBUzXQoTan+BHi5VqlIUy4k0HDTDqBixlZvzlADKYDMKdltRFrYmt7wbj8RZWT4KPwgTX/vbcHkMjNu5NIcURC4AN8FEjzasp6aUwpKUspIDkAaBRIab8XERrcZfXwbhmEoQl96GQBea9J+ksc1xKQI3a78Zz/9xD8RNzQRARimbjMt5pgrMkn0pxHmzuTlAWWJ6hKDpdcTaVs1rEheniuOglADypIwrC2ZhlQ1Ywkn04Lqd0Q1mVDFmTD+z1CDAFy7yWZm5EpN2BEFpTlkICjHrjo2tqShasZtOum3VYGHvShQQSqWn4pdhdxTJ4SksdoCrrkgZTdzBq5D9888iAqLEUSgQ0VNbE7zVMxYySmP1ey7bg3IL9cZjfAdfXMu7Nxii1ddc0HQWuVdUFcmDFRDJPSH+s1UoSDezUyDOpuLMPlZX4QjKuzTofY8r1uYZk2NFhK/7wBgNigzXu3JpcHCTOjPNtcdoPU1gtQq/epXuYKg8iUWRIEKniDfmGdUxLQ9EzLwbi1bQZHxrs6fCcP7azlLrkWgtzwWdBf36Ak2sk072M+njHKaCabmGU71FKPiI0V5YM7MQA8LWKwlWsZSHtcGtrOLLzmuMS4ywXSzLkjj7FguM9Tz3kN99DFKVmryYegFYJHDshSNhM5oUYn6qJFsFZBvSIR+YjXDeoUt7GU/h/Uj3/MLv3OBSf6tUcYkg40X6lW+xwMAEnq28JmF6mUly1nLeh5hRM/zBh/wno5ytPFCfa3Op6U2zFgwnieVK/GalyNzNiQHGnNnyU5JW4sW4vwnWN6WF9u6PZ4uKBoCzpmp68pP323GVNYpZa2Jnmp6FVj3SvELLw5dHvhL17RlB0Fmphe8VKSk59jTFvvdUtXrD1zLfksb91G0QGPe0kygr9u8scORXCZ8up2Tm5lGgrXidNu3tTSQxoEE77dRgG4TistekR1ot/1mxidpbT3cbv7jjYzNyWto2NCRrU3WJMuuCTO6O7OrOoWAbY3tpLVSBScEaKl16tAmJ0A6A4B+4KGOTW9GL19RVbW5Uf4HMZHIPWempS0AAAAASUVORK5CYII=";
    };
    
    P.prototype = new Particle();
    
    P.prototype.draw = function(delta) {
        
        Particle.prototype.draw.call(this, delta);
        
        // break when particle is not visible
        if (this.size < 1 || this.position.x < this.size || this.position.y < this.size) {
            return;
        }
        
        var x = this.position.x;
        var y = this.position.y;
        var extraContext = this.ps.__extraContext;
        var extraCanvas  = this.ps.__extraContext.canvas;
    
        extraCanvas.width = this.size;
        extraCanvas.height = this.size;
        extraContext.drawImage(this.image, 0, 0, this.size, this.size);
        
        var imageData = extraContext.getImageData(0, 0, this.size, this.size);
        var pixels = imageData.data;
        var numPixels = imageData.width * imageData.height;
        
        for (var i = 0; i < numPixels; i++) {
            var color = i*4;
    
            if (pixels[color+3] === 0) {
                continue;
            }
    
            pixels[color]   = 255 * this.color.red;     // Red
            pixels[color+1] = 255 * this.color.green; // Green
            pixels[color+2] = 255 * this.color.blue; // Blue
            pixels[color+3] = 255 * this.color.alpha; // Alpha
        };
        //extraContext.clearRect(0, 0, this.size, this.size);
        //extraContext.putImageData(imageData, 0, 0);
    
        this.ps.context.putImageData(imageData, x, y);
        //this.ps.context.drawImage(this.image, x, y, this.size, this.size);
    };

    w.ParticleStarImage = P;

})(window);


// particle subclass: uxebu

;(function(w, undefined) {

    var P = function(aParticleSystem) {
    
        this.constructor(aParticleSystem);
        
        this.image = new Image();
        // @? onload
        this.image.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAAAhCAYAAABObyzJAAANtUlEQVRo3u1aB1RVVxb9lfbpvQtKV5ogIFgBjYKIAiKgEgHpUSz4pUgRpBcBaRElNnSipsyEKEo0IBpHQNcyMYZEY4lmbBnUZBJNYpl9vu8benEyS7KWb63Lf+/d+27Z95R9zoX17Nkz1uvy8kX0hy8p9ZcqHC6Ppayiwn17yxaf9z/4IFxFTV2Jw+NzX8Vc/nIA8iQkWWw2m7Vr1+4Fz54+e+f+/QebNbV1HICqMurZrwEcbMK4Jk+dqol5V8QuXx741VcdRQDQm83l6aGe8xrAgaSPLykC8LPPTkV9VF+faDjGaOZ3331XAgA9AaA+2nBfAziA6tIVGrbMGnOuHmtp6WZkbDLrxo0bRVo6uu6s1wD2BRib1fWKjIq2wXyr4tcK38TjeEtrGxcAWAAA3WADuwHI5Uuw8I4FyRTd/18BFF0YbMgfsTndFkaTHM6gosV1ueBBe4EnK6/AMbMYK29tY6sRGRVl13LixPLHj59UrRWKwHPEqBYA0KwngNQXXdIyApa+gaEs6gQSUtIvdoL67rmOIXt/pu9ufRCAExwcNUYbGSvwhrBTbA6HtSwi0qm5uTmp/cyZhBMnTgptxo83ZKNiKF6QJkHgfPjh30Pb29uTj3366Ro4BQN8zunqKOwnOGhgbkUoW1H2trefyRllYOiOKicswAqrlwOAugCwUAwgNoYD4NgpqWlT/nXz5sZffvml+Oeffy6GncwsK9vsO9HZZTRc+IuNMxg9RsHewVGbWTd7YPsrwdLQ0paa5uqqLyMrxxODKAKwtbV11fqU1HnoU3IwO0JXRUWl3927d8tTU1PDOzo6Sg8cOLAarzVQzx+KFw0JDbN6/PhxZX5BYTR+t3jO8ZqN1ypiL0qTVVRW4U2b7mrut2CB75aamqTOzs6qZeHhkWg3Fm0USL0BoPYLANkcfQksqr6+PvDhw4fV8fFrg50mOntMmTrNWygURj148OBtrLW2+fhxWAChu4uLiw4EYHVTU/Na9CmHPiUGm7f3/Pnmv/76a4mWto4ONoywYosAPN7SEidclxCCNqQGkoN1VFlZ5Xv06LF03E5wdXP3BgjVRiamUyGF8gPtJKkul89nQSISS8vK3iJVBACbZs6aFYh7Q7Th9VBzMoSaKKZBixYHkDTOeOONmXgW9AKQVFhCku3lPc/c2tbWAW2sUSCprDG0LjNzi0nYhPJvvvmm7OLFi2UAtOy3336ree/999dTW9qUwdY9Z+5c83v37pdBEsE7eaq04WIAVwjXrYuiieKl9BAk0Le5+XgGbu2gElrnv/wyFVISj2edriD09a2Pr5/JkydPKvRGGUyDKjvdvn27YJaHpx+qRvchwbQZXKgLASm7deu2yHOff57L4/MJFE4vAGlBIs/DJmnWRZFj+iTjJZGdmxtw6tQ/iyCt3qqqqu4ZmRujGw4fzkHdJLRRHhRALwLw3mYAOB1eX/vPAJB2WbB4SfDEH3/8sVJdQ9MBYZbsQDSkta1t+YH33ltHZk5NQ9Pshx9+yJnt4enDSCC//3HZLCdnZ1NITaWpuYUrAQoAdXoAyGVA53W5fzFvWzt7Q0je5lGGoz1pw5KS1/s3NjZuxL3D8ADU+vMAhFNQkBYIpG/evJkN4x3F2EJuX9/BpukTDbGxHf8GHm2wk5pQq+yhAEgqLSEtw7969WqGf0DAIhoHAOr3R2N6jc/hsdQ1tWT/A6fiPW/+QnyvmpqWNrux8ZMNhO2rAtAG7xTp3fK4OLd/d3ZWKCop20IKBb3iV3hvGPCwjw8eTIY0OYD7jNbU0pbr7Lw3JADFUvjP06dXFxUXr8TDKABoOFQAyfvLKSjyb968lQUyTvZeEwB6AMD0Vw4gZUdUVNXk0HlBZHQ08TS1rouhhY+3t1fDWJVTpk33IhKMBSsiBJPCN8MAkMU61HA4fN/+/WT4jS2trI2GDCAkWFogy0L79NVr1kTge10A6DkiABS/z87JnX/9xo1SPI+Fyon64YkXfujQ4pMnT5K6OEAiTbFgPgCUxIRyhgPgjp07l0CKadHmANB0qACKbDCI84ULF1ITk5JprfoAcM6IAZCkEAtR+emnn0oWLV4SIOZ1bEQ4MPqKv//+e4nHnDnzyXngvSpFPi8JYNChhgYa2wIAmr8EgMngvDFkAgCg14gBUFz3t3ffDUHUkA9OaIJ3opc7duz0+fby5UKswAmSaU5csz8AWYNcW7bU+Bx57jnHDRtAmJIvL1xYm5qWThzUYEQBSF6SpPDcuXPx72zfnsBMSkGUBIiOdgB9KAfNcWNzuc8H7g2ggSS8bNzKVRNzcvPmFhYVzS0o7F7y8vI8QYRTAGAm2lsCQIvhAnjhOYCxDIBzR5QN9F8YYEKJzjHGJjPgdalODiwYk5fgXbt2LSOvoGAFmtHAPAIQC+8GIIy8BDkVyvG1tLRkwGZuZErm8/LZRkRAmQkJictp0S+nwl+thw5HjygAxdLXBpL87r59QoaYvogs6FoaEjr5/v37larqGvZEc5ikAp/448KAQLKZhgBQEjH2BjwvwfNEUaQDW0fzQjFjijmNCzQMQWOMhgMg2WNksFMYJzJyVFhEkl3ddIkk29rZzSKagvdKXQ+B5OQVBOCJBYi5w1GvTpkTEGM2AMyMiIoKJQChwrzvv/8+ITomNlJE0rlcFcTA9hgvoKq6emFlVXXAppKSAEQ+LhQnQwL1+ohE+uWBAjl5FsZLX7lqdcSfDiAyFC8FIHZWkVJE8IxLMZn1uCeaYtwzu0FXvFA4C6FbBSTPCtIgDSbD6vj666SMzExSSSMcFrGPHj0anZObG0c8j75pam4OB6jlDQ0NaSjpSFFtxUncGlQpA0CDYRJp3q1bt7KQDVoq9sJHjjT+7wAiWfkW4kJy7Wb9ASjO6vYEEKokgDtURj/l7jNmejPSp9IzK8PhgWyrqSlgAoVR0THBRLaf88OGsH379qcw6smFA/G8eu1amaKS0ng7+wlj0G+p11zvBYxK25w6dSo9LT19pYgHWtsYdwUQIHF6Jmf/COVENlcGqa4iAOGP7/UQes7+tKkpgwFQpb91i+P4fgFESmfp1tpaCvCJYsj0FUcSiyeV6w0gSxLJgaC2tvZMRvpM+0uJ0bUxK3seJKpMAmSbAFsWEUEprVKorz2MlCxybUpt7e0pkNRyCvx37toVDzY0hWgLzkDGPHr0qMTJ2YUANetmA9kcPR09fQFsLL+vFD5dzpMm6yDpUYJMkBtFIpBE5zt37pYiQeoE4FX6Ak8KmW1ILmdAAJFhnN55716llAwWweHK9UzfE90oLCp2hTcV8bTyPwC0xMmYHlLtxfN9fH3J6OMbtf5ygmQLsUAlZIlLloaGUkJASVtHVxkkuzQqJoZCQBUKmjFpzdnIsk6dNt0Xqj4JxZY2CnzS79K33+ZLScu4MLHwHyqM2BbJV4uyzZs9mTQ9p2cmaHddnc+ZM2ezMYYjNlvbysZWh8JLl8mT5zLhJ6fnsQP6c8WGaQ0IoKqauiyC7NztO3YIYYa0uhJXKWlp1sFDh5ZBzYnbiRxG8aYS7+PHW4iLmZSVly9Cjm4j4zFHs4ZwpW/Y4AU6UYDMM6ktP27VqhlIym6b5+NDmWkpppksUR4ULSxWBp5zMub6NswELdYeO6tMKf3r168XwKaShCpNmjxlFKW7Zs32IIC7Hbxg8UYElu8Cf5JeO4CqQu/BGsKuXLlSCsm37HmKBWfjTKZJ38BAZI9d3WYY9wkgXQ4Ojha3b98pO3/+fNaKFXEzAgIDx8WtXOmECCIBbXZApTbV1tbG7N+/P+jOnTsbQGbT0ZHL06dPK744fz6zpqZmBWxZGMAOOHz4iD8Slb0KvT948OCCY8eOhaPPnYuD3wwUSR2kKykp2R/quRV1wpjY2KmBQYus4IFtkpPXT+/o+FoI51EJlSO644iJg9aweeOsrHWeIBuO6Ee4Z8+ekNOnT0ei3+3QiC3btm1bhjXYLQkOtq6rq/PHPKvyCwoimTMVMlVSZC8VYGybmpqSAExFVna2X2BQkE1ISIhN4yefhKGvGsqCw8St3rt3b/DZs2ffevjoUSXW7c7uCiBjI7i6evpmSBUtb21ty8fObvr8iy/yc/LyYqGeCxFCpezeXZdet2fP+m21tYlvgtiBsnhsq30nFs/roB6pqEtCSayrw29/BW1g1xKqqqqTkFaKgFobMxlnGfsJEyYhsy083dqaBzJdBMkoOAEijTnFmZqZzWDAozMReTIHsHny+P+YEMwraXfdnhT0m5ibl78KhD76Hx99lHX58uXiixcvFdbXf5w238fHjwHPhqFYbMa54FdSA8KyCAdcWVeuXC2+dOlSIQBL9PL29tu0qUSI+HsD9Y9fUf/yikruUHGtbgAynZHYq5PBhtNwxLODKPX03FmQiNsyWWjRPXZwDONNzZl2dAYxbojFlvHYoxjKQ4Zahow79Q876IjjSKfn6oq2bI4V2higyIptFWOnBIwH7zpH0VzQxh5tHBnzYovMkCkTOXF7OAseY55MMOYEgPzimy59ivsn6mbBnKGw+zpYpzMIATpVxq86ZU6YSRO9ETDnDHLMOynG48owz3LDLLLM913/p4WiF1mMr4JC2W0NhmII+jlv4THjd+2XnmXwvQKzBnUGOMkBDr1oDkBWQon5Ro0BSbpH/2IsuH+Ff+1gv4r/uBrOuP8FiHbam0UdRYoAAAAASUVORK5CYII=";
    };
    
    P.prototype = new Particle();
    
    P.prototype.draw = function(delta) {
        
        Particle.prototype.draw.call(this, delta);
        
        // break when particle is not visible
        if (this.size < 1 || this.position.x < this.size || this.position.y < this.size) {
            return;
        }
        
        this.ps.context.drawImage(this.image, this.position.x, this.position.y, this.size, this.size);
    };

    w.ParticleUxebu = P;

})(window);