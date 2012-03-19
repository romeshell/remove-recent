
const DocInfo = imports.misc.docInfo;
const DocDisplay = imports.ui.docDisplay;
const IconGrid = imports.ui.iconGrid;
const St = imports.gi.St;
const Search = imports.ui.search;
const Lang = imports.lang;
const Clutter = imports.gi.Clutter;
const Gtk = imports.gi.Gtk;
const Main = imports.ui.main;
const Mainloop = imports.mainloop;

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
		this.icon = new IconGrid.BaseIcon(resultMeta['name'], { createIcon: resultMeta['createIcon'] });
		box.add_actor(this.icon.actor);
		this.removeButton = new St.Button({ style_class: 'window-close' });
		this.removeButton._overlap = 0;
		this.removeButton.connect('clicked',Lang.bind(this,this._removeRecent));

		box.add_actor(this.removeButton);

		this.removeButton.hide();
		this.actor.connect('enter-event',Lang.bind(this, this._onEnter));
		this.actor.connect('leave-event',Lang.bind(this, this._onLeave));
	},
	
	_removeRecent : function () {
		Gtk.RecentManager.get_default().remove_item(this.resultMeta['id']);
		for(let i = 0 ; i<DocInfo.getDocManager()._infosByTimestamp.length;i++)
		{
			if(DocInfo.getDocManager()._infosByTimestamp[i].uri == this.resultMeta['id'])
				DocInfo.getDocManager()._infosByTimestamp.splice(i,1);
		}
		delete DocInfo.getDocManager()._infosByUri[this.resultMeta['id']];
		let over = Main.overview._viewSelector._searchTab;
		over._text.text = '';
		over._doSearch();
		over._text.text = this.terms.toString();
		over._doSearch();
	},
	
	_onEnter : function () {
		let [cloneX, cloneY] = this.icon.actor.get_position();
		let [cloneWidth, cloneHeight] = this.icon.actor.get_size();
		let [bw, bh] = this.removeButton.get_size();
		let buttonY = cloneY - bh/2;
		let buttonX = cloneX + (cloneWidth - bw/2);
		this.removeButton.set_position(Math.floor(buttonX), Math.floor(buttonY));
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
