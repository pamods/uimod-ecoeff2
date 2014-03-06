(function() {
	var notEnoughEnergyBorder = 0.9;
	var notEnoughMetalBorder = 0.6;
	var blinkSpeed = 500; //ms
	
	// full
	model.metalStorageFull = ko.computed(function() {
		return model.currentMetal() >= model.maxMetal();
	});
	model.energyStorageFull = ko.computed(function() {
		return model.currentEnergy() >= model.maxEnergy();
	});
	
	// empty
	model.metalStorageEmpty = ko.computed(function() {
		return model.currentMetal() === 0;
	});
	model.energyStorageEmpty = ko.computed(function() {
		return model.currentEnergy() === 0;
	});
	
	// mid
	model.metalStorageMid = ko.computed(function() {
		return !model.metalStorageFull() && !model.metalStorageEmpty();
	});
	model.energyStorageMid = ko.computed(function() {
		return !model.energyStorageFull() && !model.energyStorageEmpty();
	});


	model.energyEff = ko.computed(function() {
		return model.energyGain() / model.energyLoss();
	});	
	model.metalEff = ko.computed(function() {
		return model.metalGain() / model.metalLoss();
	});
	
	// spoiled
	model.metalIsSpoiled = ko.computed(function() {
		return model.metalNet() > 0 && model.metalStorageFull();
	});
	model.energyIsSpoiled = ko.computed(function() {
		return model.energyNet() > 0 && model.energyStorageFull();
	});
	
	// okay
	model.metalIsOkay = ko.computed(function() {
		return model.metalNet() >= 0 && model.metalStorageMid();
	});
	model.energyIsOkay = ko.computed(function() {
		return model.energyNet() >= 0 && model.energyStorageMid(); 
	});
	
	// dropping
	model.metalIsDropping = ko.computed(function() {
		return model.metalNet() < 0 && model.currentMetal() > 0;
	});
	model.energyIsDropping = ko.computed(function() {
		return model.energyNet() < 0 && model.currentEnergy() > 0;
	});
	
	// stalling
	model.metalIsStalling = ko.computed(function() {
		return model.metalNet() < 0 && model.currentMetal() === 0;
	});
	model.energyIsStalling = ko.computed(function() {
		return model.energyNet() < 0 && model.currentEnergy() === 0;
	});
	
	// stalling hard
	model.notEnoughEnergy/*pylons*/ = ko.computed(function() {
		return model.energyIsStalling() && model.energyEff() < notEnoughEnergyBorder;
	});
	model.notEnoughMetal = ko.computed(function() {
		return model.metalIsStalling() && model.metalEff() < notEnoughMetalBorder;
	});
	
	// states for overall:
	
	model.overallEff = ko.computed(function() {
		return Math.min(model.energyEff(), model.metalEff());
	});
	
	model.notEnoughRes = ko.computed(function() {
		return model.notEnoughEnergy() || model.notEnoughMetal();
	});
	
	model.overallStalling = ko.computed(function() {
		return (model.metalIsStalling() || model.energyIsStalling()) && !model.notEnoughRes();
	});
	
	model.overallDropping = ko.computed(function() {**
		return model.metalIsDropping() && (model.energyIsSpoiled() || model.energyIsOkay() || model.energyIsDropping());
	});

	model.overallOk = ko.computed(function() {
		return (!model.metalIsSpoiled() && !model.energyIsSpoiled()) && (model.metalIsSpoiled() || model.metalIsOkay()) && (model.energyIsSpoiled() || model.energyIsOkay());
	});	
	
	model.overallSpoiled = ko.computed(function() {
		return model.metalIsSpoiled() && model.energyIsSpoiled();
	});

	model.isBlink = ko.observable(false);
	var toggleBlink = function() {
		window.setTimeout(function() {
			model.isBlink(!model.isBlink());
			toggleBlink();
		}, blinkSpeed);
	};
	toggleBlink();
	
	// bindings for the display stuff
	
	model.energyNetK = ko.computed(function() {
		return model.energyNet() / 1000;
	});
	model.energyGainK = ko.computed(function() {
		return model.energyGain() / 1000;
	});
	model.energyLossK = ko.computed(function() {
		return model.energyLoss() / 1000;
	});
	model.energyNetKStr = ko.computed(function() {
		var positive = model.energyNetK() > 0;
		var a = positive ? "+" : "";
		if (model.energyNet() < 1000 && model.energyNet() > -1000)
		{
			return a+model.energyNet();
		}
		
		return a+model.energyNetK()+" K";
	});
	model.energyGainKStr = ko.computed(function() {
		return model.energyGainK().toFixed(2)+"K";
	});
	model.energyLossKStr = ko.computed(function() {
		return model.energyLossK().toFixed(2)+"K";
	});

	model.maxEnergyKStr = ko.computed(function() {
		var energyStorageK = model.maxEnergy() / 1000;
		if (energyStorageK > 0)
			return energyStorageK+"K";
		return energyStorageK;
	});

	model.currentEnergyKStr = ko.computed(function() {
		var currentEnergyK = model.currentEnergy() / 1000;
		if (currentEnergyK > 0)
			return currentEnergyK+"K";
		return currentEnergyK;
	});

	model.maxMetalKStr = ko.computed(function() {
		var metalstorageK = model.maxMetal() / 1000;
		if (metalstorageK > 0)
			return metalstorageK+"K";
		return metalstorageK;
	});

	model.currentMetalKStr = ko.computed(function() {
		var currentMetalK = model.currentMetal() / 1000;
		if (currentMetalK > 0)
			return currentMetalK+" K";
		return currentMetalK;
	});
	
	var possibleInf = function(n) {
		if (!isFinite(n)) {
			return "∞";
		} else {
			return n;
		}
	}
	
	model.roundOverallEff = ko.computed(function() {
		return '' + possibleInf(Math.floor(model.overallEff() * 100)) + '%'; 
	});
	model.roundMetalEff = ko.computed(function() {
		return '' + possibleInf(Math.floor(100 * model.metalEff())) + '%';
	});
	model.roundEnergyEff = ko.computed(function() {
		return '' + possibleInf(Math.floor(100 * model.energyEff())) + '%';
	});
	
	$('.div_status_bar').empty().load("coui://ui/mods/ecoeff2/live_game_econ.html", function() {
		ko.applyBindings(model, $('#ecoeff2container').get(0));
	});
}());
