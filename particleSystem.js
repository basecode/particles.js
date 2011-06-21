/**
 * particleSystem Class v0.0.1
 * http://basecode.appspot.com/particles.html
 * Copyright 2011, Tobias Reiss, @basecode
 * Licensed under the MIT license.
 * Date: Jun 17 2011

 * coding style:
 * this.blub   = public property
 * this._blub  = protected property
 * this.__blub = private property
 */

;(function(w, undefined) {
    
    "use strict";
    
    // constructor particle system
    var PS = function () {
        
        var value;
        
        // context
        this.context = arguments[0];
        
        // callbacks
        this.delegate = {};
        
        // particles
        this._particles = [];
        
        // canvas for manipulation
        var element = document.createElement("canvas");
        document.body.appendChild(element);
        element.width = 100;
        element.height = 100;
        element.style.backgroundColor = 'rgba(0,0,0,0)';
        element.style.position = 'absolute';
        element.style.zIndex = 10;
        element.style.left = -200 + 'px';
        element.style.top = -200 + 'px';
        this.__extraContext = element.getContext("2d");

        // config
        this._config = {};
        
        for(var i = 0, a = ["shape","globalComposite", "lifespan", "lifespanVariance", "startSize",
            "startSizeVariance", "endSize", "endSizeVariance", "position", "positionVariance",
            "speed", "speedVariance", "startColor", "startColorVariance",
            "endColor", "endColorVariance", "radialAcceleration", "radialAccelerationVariance",
            "tangentialAcceleration", "tangentialAccelerationVariance", "angle", "angleVariance", 
            "gravity", "totalParticles"], len = a.length; i < len; i++) {
            this.updateConfig(a[i], null);
        }
        
        var configFile = (arguments[1] && typeof arguments[1] === 'object') && arguments[1];
        
        if (configFile) {
            this.importConfig(configFile);
        }

        this.rate = 0;

        // callback
        /*var callback = arguments[2] || arguments[1]; 
        if (typeof callback === 'function') {
            this.callback = callback;
        }*/
    };
    
    PS.prototype.importConfig = function(config) {
        
        for (var value in config) {
            this.updateConfig(value, config[value]);
        }
        this.restart();
    };
    
    PS.prototype.updateConfig = function(key, value) {
        
        var newValue;
        
        switch(key) {
            case "shape":
                newValue = value || "bubble";
                break;
            case "globalComposite":
                newValue = value || 'destination-over';
                break;
            case "lifespan" :
                newValue = value || 2.0;
                break;
            case "lifespanVariance" :
                newValue = value || 0.0;
                break;
            case "startSize" : 
                newValue = value || 20;
                break;
            case "startSizeVariance" : 
                newValue = value || 0;
                break;
            case "endSize" : 
                newValue = value || 0;
                break;
            case "endSizeVariance" : 
                newValue = value || 0;
                break;
            case "radialAcceleration":
                newValue = value || 0;
                break;
            case "radialAccelerationVariance":
                newValue = value || 0;
                break;
            case "tangentialAcceleration":
                newValue = value || 0;
                break;
            case "tangentialAccelerationVariance":
                newValue = value || 0;
                break;
            case "position" :
                newValue = value || Glb.point.make(10,10);
                break;
            case "positionVariance" :
                newValue = value || Glb.point.make(0,0);
                break;
            case "speed" :
                newValue = value || 0;
                break;
            case "speedVariance" :
                newValue = value || 0;
                break;
            case "angle":
                newValue = value || 0;
                break;
            case "angleVariance":
                newValue = value || 0;
                break;
            case "startColor" :
                newValue = value || Glb.color.makeRGBA(0.5,0.5,0.5,1);
                break;
            case "startColorVariance" :
                newValue = value || Glb.color.makeRGBA(0,0,0,0);
                break;
            case "endColor" :
                newValue = value || Glb.color.makeRGBA(1,1,1,1);
                break;
            case "endColorVariance" :
                newValue = value || Glb.color.makeRGBA(0,0,0,0);
                break;
            case "gravity":
                newValue = value || Glb.point.make(0,0);
                break;
            case "totalParticles":
                newValue = value || 20;
                break;
        }
        
        this._config[key] = newValue;
        this._config['emitsAfterMs'] = 1000 / Math.ceil(this._config.totalParticles / this._config.lifespan);
        this._config['emitterMode'] = "GRAVITY";
        
        //this.restart();
        
        this.delegate.updateConfig && this.delegate.updateConfig(this._config, {key : key, value : value});
    };
    
    // event loop identifier
    PS.prototype.loop = {
        kill : 0,
        deltaSum : 0,
        lastTime : 0,
        id : 0
    };
    
    // event loop
    
    PS.prototype.animFrame = function(time) {
        
        var self = this;
        var delta = time - this.loop.lastTime;
        var emitsAfterMs = this._config['emitsAfterMs'];
        var emissionsPerFrame = 0;
        var emittedParticles  = 0;
        
        if (delta > 200 && this.delegate.appIsRunningSlow) {
            this.delegate.appIsRunningSlow(delta);
        }
        
        this.loop.deltaSum += delta;
        this.loop.lastTime = time;
        
        // clear the canvas
        this.clearCanvas();
        
        // this gives us the amount of particles, that will be emitted in this frame
        if (this.loop.deltaSum >= emitsAfterMs) {
            emissionsPerFrame = Math.floor(this.loop.deltaSum / emitsAfterMs);
            this.loop.deltaSum = 0;
        }
        
        if (emissionsPerFrame > 0) {
            
            Glb.console.logPrio3("\n");
            
            for(var i = 0; i >= 0; i++) {
            
                if (emittedParticles === emissionsPerFrame || i > this._config['totalParticles']) {
                    break;
                }
    
                // create new particle, if no exists
                if (!this._particles[i]) {
                    Glb.console.logPrio3("animFrame: init new particle");
                    this._particles[i] = new window['Particle' + this._config['shape']](this);
                    emittedParticles++;
                    continue;
                }
    
                // continue if this particle is already in work
                if (this._particles[i].timeToLive > 0) {
                    Glb.console.logPrio3("animFrame: [%s] is already alive", this._particles[i].id);
                    continue;
                }
                
                // reset existing and sleeping particle
                Glb.console.logPrio3("animFrame: reset");
                this._particles[i].reset();
                emittedParticles++;
            }
            Glb.console.logPrio3("emittedParticles: %d", emittedParticles);
        }
        
        // draw particles
        for (var i = 0, len = this._particles.length; i < len; i++) {
            if (this._particles[i].timeToLive > 0) {
                this._particles[i].draw(delta);
            }
        }

        if (!this.loop.kill) {
            this.loop.id = w.requestAnimFrame(function(time) { 
                self.animFrame(time);
            });
        }

        /*
        Most computer monitors refresh at a rate of 60 Hz, which basically means 
        there’s a repaint 60 times per second. Given that, the best interval for 
        the smoothest animation is 1000ms / 60, or about 17ms
        
        this.loop.timout = w.setTimeout(function() { 
            if (self.loop.kill) {
                return;
            }
            self.animFrame();
        }, 17);
        */

        return this;
    };
    
    PS.prototype.clearCanvas = function() {
        //var backgroundColor = this.config.backgroundColor || "#000";
        //this.context.fillStyle = "#000";
        //this.context.fillRect(0, 0, this.canvasSize.width, this.canvasSize.width);
        this.context.clearRect(0, 0, this.context.canvas.width, this.context.canvas.height);
        
        return this;
    };
    
    PS.prototype.start = function() {
        Glb.console.log("start loop");
        var self = this;
        this.loop.kill = 0;
        this.loop.lastTime = w.animStartTime;
        this.loop.id = w.requestAnimFrame(function(time) { 
            if (self._config['emissionPerSecondRatio'] <= 0) {
                Glb.console.warning('Not enough particles');
                return;
            }
            self.animFrame(time);
        });
        return this;
    };
    
    PS.prototype.pause = function() {
        Glb.console.log("pause loop");
        w.cancelRequestAnimFrame(this.loop.id);
        this.loop.kill = 1;
        return this;
    };
    
    PS.prototype.stop = function(sec) {
        var self = this;
        var sec  = sec || 0;

        w.setTimeout(function() {
            Glb.console.log("stop loop");

            this.freeMemory();

        }, 1000 * (sec || 0));
        return this;
    };
    
    PS.prototype.restart = function() {
        this.freeMemory().start();
    };
    
    PS.prototype.freeMemory = function() {
        
        // stop main loop
        w.cancelRequestAnimFrame(this.loop.id);
        this.loop.kill = 1;
        
        // clear canvas completely
        this.context.canvas.width = this.context.canvas.width;
        
        // remove references to particle classes and give GC a chance to
        // release them
        for (var i = 0, len = this._particles.length; i < len; i++) {
            delete this._particles[i];
        }
        this._particles.length = 0;
        
        return this;
    };
    
    PS.prototype.setDelegate = function(delegate) {
        this.delegate = delegate;
        return this;
    };
    
    w.ParticleSystem = PS;

})(window);

