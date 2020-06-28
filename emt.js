/* Magic Mirror
 * Module: emt
 *
 * By Iñaki Reta Sabarrós https://github.com/jirsis
 * MIT Licensed.
 */

Module.register("emt", {
    defaults: {

        idClient: "",
        passKey: "",
        busStops: [5511],

        warningTime: 5, 
        colored: true,
		showDestination: true,

        apiBase: "https://openapi.emtmadrid.es/v1",

        animationSpeed: 2000,

        initialLoadDelay: 2500,
        updateInterval: 60 * 1000, //every 1 minute

        fade: true,
        fadePoint: 0.25, // Start on 1/4th of the list.
    },

    requiresVersion: "2.1.0",

    getStyles: function() {
		return ["emt.css"];
    },
    
    getScripts: function () {
		return [
		    'https://use.fontawesome.com/releases/v5.0.6/js/all.js'
		];
	},

    start: function(){
        Log.log("Starting module: " + this.name);
        this.scheduleUpdate(this.config.initialLoadDelay);
        this.loaded = false;
    },

    updateEmt: function(){
        var self = this;
        this.busesInfo = [];

	    fetch(`${this.config.apiBase}/mobilitylabs/user/login/`, { 
		    method: 'GET',
		    headers: new Headers({'X-ClientId': this.config.idClient, 'passKey': this.config.passKey})
		    })
	    .then(loginResponse => {
		   return loginResponse.json();
	    })
	    .then(data =>{
		   return data.data[0].accessToken;
	    })
	    .then(accessToken => {
		   var formatResponse = {
		    "statistics":"N",
		    "cultureInfo":"EN",
		    "Text_StopRequired_YN":"Y",
		    "Text_EstimationsRequired_YN":"Y",
		    "Text_IncidencesRequired_YN":"Y",
		    "DateTime_Referenced_Incidencies_YYYYMMDD":"20180823"
		   }
		   let busStopsRequests = self.config.busStops.map((stop) => {
		       Log.info(`bus stop: ${stop}`);
		       return fetch(`${self.config.apiBase}/transport/busemtmad/stops/${stop}/arrives/all/`, {
	               method: 'POST',
		           headers: new Headers({'accessToken': accessToken, 'content-type': 'application/json'}),
		           body: JSON.stringify(formatResponse),
		           })
		       .then(arrivedResponse => {
		           return arrivedResponse.json();
		       })
		   });
		   Promise.all(busStopsRequests).then(allResults => {
		       allResults.map(arrivalInfo => self.processEmtInformation(arrivalInfo.data[0].Arrive));
			   self.scheduleUpdate(self.config.updateInterval);
		   });
	    });

/*            if (emtResponse.ReturnCode){
				self.showError(emtResponse.Description);
				self.scheduleUpdate(self.config.updateInterval);
		  }else{
			      self.processEmtInformation(data.data[0].Arrive);
			      self.scheduleUpdate(self.config.updateInterval);
		       })
		   }
*/
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        if (this.config.idClient === "") {
			return this.emtNotConfigurated(wrapper);
		}
		if (!this.loaded) {
			return this.emtNotLoaded(wrapper);
        }

        if(this.error){
            wrapper.innerHTML = this.name + ": "+this.error;
            wrapper.className = "dimmed light small";
            this.error = undefined;
		    return wrapper;
        }
        var table = document.createElement("table");
        table.className = "small";

        var buses = this.busesInfo.sort(function(a, b){
            var compare = a.eta-b.eta;
            if(compare === 0){
                compare = a.distance - b.distance;
            }
            return compare;
        });

        for (var b in buses){
            var bus = buses[b];
            var row = this.printRow(table, bus);
            this.printIcon(row, bus);
            this.printLine(row, bus);
			this.printDestination(row, bus);
            this.printTime(row, bus);
            this.printDistance(row, bus);
            this.fadeTable(row, buses, b);
        }
        return table;
    },

    printRow: function(table, bus){
        var row = document.createElement("tr");
        if (this.config.colored && Math.floor(bus.eta/60) <= this.config.warningTime ){
            row.className = "near ";
        }
        table.appendChild(row);
        return row;
    },

    printIcon: function(row, bus){
        var iconCell = document.createElement("td");
		iconCell.className = "bus-icon ";
        row.appendChild(iconCell);
        var busIcon = document.createElement("i");
		busIcon.className = "fas fa-bus";
		iconCell.appendChild(busIcon);
        row.appendChild(iconCell);

//		var busStopCell = document.createElement("td");
//		busStopCell.className="bus-stop";
//		busStopCell.innerHTML = bus.busStop;
//		row.appendChild(busStopCell);

    },

    printLine: function(row, bus){
        var lineCell = document.createElement("td");
        lineCell.className = "bright line ";
        lineCell.innerHTML = bus.line;
        row.appendChild(lineCell);
    },
    printDestination: function(row, bus){
		if(this.config.showDestination){
            var destinationCell = document.createElement("td");
            destinationCell.className = "bright line destination";
            destinationCell.innerHTML = bus.destination.toLowerCase();
            row.appendChild(destinationCell);
	 	}
    },

    printTime: function(row, bus){
        var timeCell = document.createElement("td");
        timeCell.className = "bright time ";
        timeCell.innerHTML = bus.eta===999999?"+20min":Math.floor(bus.eta/60).toString()+"min";;
        row.appendChild(timeCell);
    },

    printDistance: function(row, bus){
        var km = Math.ceil(bus.distance/1000);
        var m = bus.distance%1000;
        
        var distanceKmCell = document.createElement("td");
        distanceKmCell.className = "align-right ";
        distanceKmCell.innerHTML = km;
        row.appendChild(distanceKmCell);

        var distanceMCell = document.createElement("td");
        distanceMCell.className = "align-left ";
        distanceMCell.innerHTML = `.${m}`;
        row.appendChild(distanceMCell);;

        var kmLabelCell = document.createElement("td");
        kmLabelCell.className = "align-center ";
        kmLabelCell.innerHTML = "km";
        row.appendChild(kmLabelCell);
    },

    fadeTable: function(row, buses, currentBus){
        if (this.config.fade && this.config.fadePoint < 1) {
            if (this.config.fadePoint < 0) {
                this.config.fadePoint = 0;
            }
            var startingPoint = buses.length * this.config.fadePoint;
            var steps = buses.length - startingPoint;
            if (currentBus >= startingPoint) {
                var currentStep = currentBus - startingPoint;
                row.style.opacity = 1 - (1 / steps * currentStep);
            }
        }
    },

    emtNotConfigurated: function(wrapper){
        wrapper.innerHTML = "Please set the correct emt <i>idClient</i> in the config for module: " + this.name + ".";
		wrapper.className = "dimmed light small";
		return wrapper;
    },

    emtNotLoaded: function(wrapper){
        wrapper.innerHTML = this.name + " "+this.translate("LOADING");
		wrapper.className = "dimmed light small";
		return wrapper;
    },

    scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		var self = this;
		setTimeout(function() {
			self.updateEmt();
		}, nextLoad);
	},

    processEmtInformation: function(busStop){
        for (bus of busStop){
            var busInfo = {};
			Log.info(bus);
            busInfo.line = bus.line;
            busInfo.distance = bus.DistanceBus;
            busInfo.eta = bus.estimateArrive;
			busInfo.destination = bus.destination;
			busInfo.busStop = bus.stop;
            this.busesInfo.push(busInfo);
        }
        
        this.show(this.config.animationSpeed, {lockString:this.identifier});
        this.loaded=true;
        this.updateDom(this.config.animationSpeed);
    },

    showError: function(errorDescription){
        this.error = errorDescription;
        Log.info(errorDescription);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "BUS_STOP_EVENTS") {
            Log.log(payload);
        }    
        this.updateDom(this.config.animationSpeed);
    },
});
