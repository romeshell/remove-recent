
const DocDisplay = imports.ui.docDisplay;
const IconGrid = imports.ui.iconGrid;
const St = imports.gi.St;
const Search = imports.ui.search;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;
const Main = imports.ui.main;

function RecentIcon(resultMeta, terms){
	this._init(resultMeta, terms);
}

RecentIcon.prototype = {
	_init:function(resultMeta, terms){
		this.actor = new St.Bin({ style_class: 'search-result-content',
									reactive: true,
									track_hover: true });
		this.resultMeta=resultMeta;
		this.terms=terms;
		let box = new Clutter.Group();
		this.actor.add_actor(box);
		let icon = new IconGrid.BaseIcon(resultMeta['name'], { createIcon: resultMeta['createIcon'] });
		box.add_actor(icon.actor);
		this.removeButton = new St.Button({ style_class: 'window-close' });
		this.removeButton.connect('clicked',Lang.bind(this,this._removeRecent));
		box.add_actor(this.removeButton);
		this.removeButton.hide();
		this.actor.connect('enter-event',Lang.bind(this, this._onEnter));
		this.actor.connect('leave-event',Lang.bind(this, this._onLeave));
	},
	
	_removeRecent : function () {
		Gtk.RecentManager.get_default().remove_item(this.resultMeta['id']);
		global.log("terms:"+this.terms);
		Main.overview._viewSelector._searchTab._onTextChanged(null,null);
		global.log("terms:"+this.terms);
	},
	
	_onEnter : function () {
		this.removeButton.show();
	},
	
	_onLeave : function () {
		this.removeButton.hide();
	}
}

function RemoveRecent(){
	this._init();
}

RemoveRecent.prototype ={
	_init: function(){
		DocDisplay.DocSearchProvider.prototype.createResultActor = this.createResultActor;
	},
	
	createResultActor: function(resultMeta, terms) {
		let icon  = new RecentIcon(resultMeta, terms);
		return icon.actor;
	},
	
	destroy : function() {
		DocDisplay.DocSearchProvider.prototype.createResultActor = Search.SearchProvider.prototype.createResultActor;
	}
}


function init(){

}

let removeRecent;
function enable(){
	removeRecent = new RemoveRecent();
}

function disable(){
	removeRecent.destroy();
}
