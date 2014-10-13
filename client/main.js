/* Bug Swatter Object */
var bs = {};
bs.db = {};
bs.io = {};
bs.db.data = ko.observableArray();
bs.DEBUG = ko.observable(false);
bs.VERSION = ko.observable("2.0");
bs.db.tasksName = ko.observable("tasks");
bs.db.statusesName = ko.observable("statuses");
bs.db.inlineTasksStatus = ko.observableArray();
bs.db.detailedTasksStatus = ko.observableArray();
bs.settings = {};
bs.settings.page = ko.observable("settings");

bs.events = {
    onAlert: function(sData){},
    io: {
        onConnect: function(sData){},
        onConnecting: function(sData){},
        onDisconnect: function(sData){},
        onConnectFailed: function(sData){},
        onError: function(sData){},
        onMessage: function(sData){},
        onAnything: function(sData){},
        onReconnectFailed: function(sData){},
        onReconnect: function(sData){},
        onReconnecting: function(sData){}
    },
    db: {
        onOpen: function(sData){},
        onUpgrade: function(sData){},
        onAdd: function(sData){},
        onRemove: function(sData){},
        onSet: function(sData){},
        onGetDBData: function(sData){},
        onFetchInitialData: function(sData){}
    },
    tasks: {
        onAdd: function(sData){},
        onRemove: function(sData){},
        onSet: function(sData){},
        onUpdate: function(sData){}
    },
    statuses: {
        onAdd: function(sData){},
        onRemove: function(sData){},
        onSet: function(sData){},
        onUpdate: function(sData){}
    }
};


/********************* General Functions *********************/
bs.alert = function(sMessage, sLocation, sDebugStatement){
    var location = "";
    var debugStatement = false;
    var showMessage = true;

    if(bs.DEBUG && typeof sLocation == 'string'){
        location = " - " + sLocation;
    } else if(typeof sLocation == 'boolean'){
        debugStatement = sLocation
    }

    if(typeof sDebugStatement == 'boolean'){
        debugStatement = sDebugStatement;
    }

    if(debugStatement == true)
        if(bs.DEBUG == false)
            showMessage = false;

    if(showMessage){
        if(typeof sMessage === 'object'){
            console.log("Bug Swatter" + location + ":");
            console.log(sMessage);
            console.log("");
        } else{
            console.log("Bug Swatter" + location + ": " + sMessage);
        }
    }

    bs.events.onAlert({ "message" : sMessage, "location" : sLocation, "debugStatement": debugStatement});
};


/********************* Socket IO *********************/
bs.io.connect = function(){
    bs.io.socket = io.connect("http://localhost:3000/");

    /* Add Socket IO handlers */
    bs.io.socket.on('connecting', bs.io.onConnecting);
    bs.io.socket.on('connect', bs.io.onConnect);
    bs.io.socket.on('disconnect', bs.io.onDisconnect);
    bs.io.socket.on('connect_failed', bs.io.onConnectFailed);
    bs.io.socket.on('error', bs.io.onError);
    bs.io.socket.on('message', bs.io.onMessage);
    bs.io.socket.on('anything', bs.io.onAnything);
    bs.io.socket.on('reconnect_failed', bs.io.onReconnectFailed);
    bs.io.socket.on('reconnect', bs.io.onReconnect);
    bs.io.socket.on('reconnecting', bs.io.onReconnecting);

    /* Add custom Socket IO handlers */
    bs.io.socket.on('authRes', bs.io.onAuthRes);
};

bs.io.onConnecting = function(){
    bs.alert("Connecting", "bs.io.onConnecting");
};

bs.io.onConnect = function(){
    bs.alert("Connected", "bs.io.onConnect")
};

bs.io.onDisconnect = function(){
    bs.alert("Disconnect", "bs.io.onDisconnect");
};

bs.io.onConnectFailed = function(){
    bs.alert("Connect Failed", "bs.io.onConnectFailed");
};

bs.io.onError = function(){
    bs.alert("Error", "bs.io.onError");
};

bs.io.onMessage = function(message){
    bs.alert(message, "bs.io.onMessage");
};

bs.io.onAnything = function(data){
    bs.alert(data, "bs.io.onAnything");
};

bs.io.onReconnectFailed = function(){
    bs.alert("Reconect Failed", "bs.io.onReconnectFailed");
};

bs.io.onReconnect = function(){
    bs.alert("Reconected", "bs.io.onReconnect");
};

bs.io.onReconnecting = function(){
    bs.alert("Reconnecting", "bs.io.onReconnecting");
};
//Custom Socket IO Handlers
bs.io.onAuthRes = function(data){
    bs.alert("Auth Responded", "bs.io.authRes");
    bs.alert(data);
};
//Custom Socket IO Senders */
bs.io.authReq = function(username, password){
    if(!username){
        bs.alert("A username must be specified", "bs.io.authReq"); 
        return;
    } 
    if(!password){
        bs.alert("A password must be specified", "bs.io.authReq"); 
        return;
    } 

    bs.io.socket.emit('authReq', { "username": username, "password": password });
};


/********************* Database Functions *********************/
bs.db.open = function(dbName){
    var version = 1;
    var request = indexedDB.open(dbName, version);

    request.onupgradeneeded = function(e){
        var db = e.target.result;

        e.target.transaction.onerror = bs.db.onerror;

        if(db.objectStoreNames.contains(dbName)){
            db.deleteObjectStore(dbName);
        }

        var store = db.createObjectStore(dbName, 
        {
            keyPath: "id"   
        });

        bs.events.db.onUpgrade({ "dbName": dbName });
    };

    request.onsuccess = function(e){
        bs.db[dbName] = ko.observable(e.target.result);
        bs.db.data()[dbName] = ko.observableArray();
        bs.db.getDBData(dbName, "open");
        bs.events.db.onOpen({ "dbName": dbName });
    };

    request.onerror = bs.db.onerror;
};

bs.db.add = function(sName, sData){
    var db = bs.db[sName]();
    var transaction = db.transaction([sName], "readwrite");
    var store = transaction.objectStore(sName);
    var request = store.put(sData.getDump());
    
    request.onsuccess = function(e){
        bs.events.db.onAdd({ "dbName": sName, "data": sData });
    };

    request.onerror = function(e){
        bs.alert(e.value, "bs.db.add() onerror");
    };

    return request;
};

bs.db.remove = function(sName, sData){
    var db = bs.db[sName]();
    var transaction = db.transaction([sName], "readwrite");
    var store = transaction.objectStore(sName);

    if(sData.getID() != undefined){
        var request = store.delete(sData.getID());
    } else{
        bs.alert("To delete an object the object needs and 'id' key", "bs.db.remove() sData id check");
        return;
    }

    request.onsuccess = function(e){
        bs.events.bs.onRemove({ "dbName": sName, "data": data });
    };

    request.onerror = function(e){
        console.log(e);
    };

    return request;
};

bs.db.set = function(sName, sData){
    var db = bs.db[sName]();
    var transaction = db.transaction([sName], "readwrite");
    var store = transaction.objectStore(sName);

    var request = store.put(sData);

    request.onsuccess = function(e){
        bs.events.db.onSet({ "dbName": sName, "data": sData });
    }

    request.onerror = function(e){
        console.log(e);
    };

    return request;
}

bs.db.getDBData = function(dbName, sData){
    var db = bs.db[dbName]();
    var transaction = db.transaction([dbName], "readwrite");
    var store = transaction.objectStore(dbName);

    var keyRange = IDBKeyRange.lowerBound(0);
    var cursorRequest = store.openCursor(keyRange);

    var dbStoreVar = [];

    cursorRequest.onsuccess = function(e){
        var result = e.target.result;
        if(!!result == false){
            bs.db.data()[dbName](dbStoreVar);
            
            bs.events.db.onGetDBData({ "dbName": dbName, "dbStoreVar": dbStoreVar, "data": sData });
            switch(dbName){
                case bs.db.tasksName():
                    bs.events.tasks.onUpdate({});
                break;

                case bs.db.statusesName():
                    bs.events.statuses.onUpdate({});
                break;
            }
            return;
        }

        /* Put retrieved items into wrappers if they have one */
        switch(dbName){
            case bs.db.tasksName():
                var storeVal = result.value;

                if(!!storeVal.status){
                    switch(typeof storeVal.status){
                        case "object"://status dump was stored
                            var tempStatus = new status(storeVal.status.id);
                            var tempStatusIndex = bs.db.findStatusByID(tempStatus.getID());
                            if(tempStatusIndex != undefined){
                                var tempRealStatus = bs.db.data()[bs.db.statusesName()]()[tempStatusIndex];
                                tempStatus.setColor(tempRealStatus.getColor());//Set color
                                tempStatus.setShared(tempRealStatus.getShared());//Set shared
                                tempStatus.setDisplayName(tempRealStatus.getDisplayName());//Set displayName
                            }
                            storeVal.status = tempStatus;

                        break;

                        case "number"://status number stored
                            storeVal.status = bs.db.data()[bs.db.statusesName()]()[bs.db.findStatusByID(storeVal.status)];
                        break;
                    }
                }
                storeVal = new task(storeVal);

                dbStoreVar.push(storeVal);

            break;

            case bs.db.statusesName():
                dbStoreVar.push(new status(result.value));
            break;

            default:
                dbStoreVar.push(result.value);
            break;
        }
        result.continue();
    };
    
    cursorRequest.onerror = bs.db.onerror;
};


/********************* Task Functions *********************/
bs.db.addTask = function(sTask){
    var request = bs.db.add(bs.db.tasksName(), sTask);
    
    request.onsuccess = function(e){
        bs.db.updateTasks();
        bs.events.tasks.onAdd({ "task": sTask });
    };

    request.onerror = function(e){
        bs.alert(e.value, "bs.db.addTask() onerror");
    };
};

bs.db.removeTask = function(sTask){
    var editTask;

    if(typeof sTask == 'number'){
        editTask = bs.db.data()[bs.db.tasksName()]()[bs.db.findTaskByID(sTask)];
    } else{
        editTask = sTask;
    }

    if(editTask == undefined){
        bs.alert("Error removing task, task ID must be for a valid task", "bs.db.removeTask");
        return;
    }

    var request = bs.db.remove(bs.db.tasksName(), editTask);

    request.onsuccess = function(e){
        bs.db.updateTasks();
        bs.events.tasks.onRemove({ "task": sTask });
    }

    request.onerror = function(e){
        bs.alert(e.value, "bs.db.removeTask() onerror");
    };
};

bs.db.setTask = function(sObject){
    if(sObject.id == undefined){
        bs.alert("Error setting task, task ID not set", "bs.db.setTask");
        return;
    }

    var editObject;

    /*$(bs.db.data()[bs.db.tasksName()]()).each(function(){//Finding existing task
        if(this.id == sObject.id){
            editObject = this;
            editObject = new task(this.id, this.status.id);
        }
    });*/
    if(bs.db.findTaskByID(sObject.id) != undefined){
        editObject = bs.db.data()[bs.db.tasksName()]()[bs.db.findTaskByID(sObject.id)];//PROBLEM WITH SETTING INLINE TASK
    }
    
    if(editObject == undefined){
        editObject = new task(0, "Not available", 0);
    }

    $.each(sObject, function(key, value){
        switch(key){
            case 'status':
                var sValue = value;
                if(typeof value == "function"){
                    sValue = value();
                }

                if(typeof sValue == "object"){
                    editObject.set(key, sValue);
                } else if(typeof sValue == "number"){
                    editObject.set(key, bs.db.data()[bs.db.statusesName()]()[bs.db.findStatusByID(sValue)]);
                } else{
                    bs.alert("Error setting task, status is not valid", "bs.db.setTask");
                }
            break;

            default:
                editObject.set(key, value);
            break;
        }
    });
    
    var request = bs.db.set(bs.db.tasksName(), editObject.getDump());

    request.onsuccess = function(e){
        bs.db.updateTasks();
        bs.db.updateStatuses();
        bs.events.tasks.onSet(sObject);
    }

    request.onerror = function(e){
        bs.alert(e.value, "bs.db.setTask() onerror");
    };
};

bs.db.updateTasks = function(){
    bs.db.getDBData(bs.db.tasksName());
    bs.events.tasks.onUpdate({});
};

bs.db.findTaskByID = function(tID){
    var taskData = bs.db.data()[bs.db.tasksName()]();
    var taskDataKey = undefined;
    $.each(taskData, function(key, value){
        if(value.getID() == tID){
            taskDataKey = key;
        }
    });

    return taskDataKey;
};

/********************* Status Functions *********************/
bs.db.addStatus = function(sStatus){
    var request = bs.db.add(bs.db.statusesName(), sStatus);
    
    request.onsuccess = function(e){
        bs.db.updateStatuses();
        bs.events.statuses.onAdd({ "status": sStatus });
    };

    request.onerror = function(e){
        bs.alert(e.value, "bs.db.addStatus() onerror");
    };
};

bs.db.removeStatus = function(sStatus){
    var request = bs.db.remove(bs.db.statusesName(), sStatus);

    request.onsuccess = function(e){
        bs.db.updateStatuses();

        $.each(bs.db.data()[bs.db.tasksName()](), function(key, value){//Remove all tasks will this status
            if(value.getStatus().getID() == sStatus.getID()){
                bs.db.removeTask(value);
            }
        });

        bs.events.statuses.onRemove({ "status": sStatus });
    }

    request.onerror = function(e){
        bs.alert(e.value, "bs.db.removeStatus() onerror");
    };
};

bs.db.setStatus = function(sObject){
    if(sObject.id == undefined){
        bs.alert("Error setting status, status ID not set", "bs.db.setStatus");
        return;
    }

    var editObject;

    
    if(bs.db.findStatusByID(sObject.id) != undefined){
        editObject = bs.db.data()[bs.db.statusesName()]()[bs.db.findStatusByID(sObject.id)];//PROBLEM WITH SETTING INLINE TASK
    }
    
    if(editObject == undefined){
        editObject = new status(0, "Not available", false, "#000000");
    }

    $.each(sObject, function(key, value){
        editObject.set(key, value);
    });
    
    var request = bs.db.set(bs.db.statusesName(), editObject.getDump());

    request.onsuccess = function(e){
        bs.db.updateStatuses();
        bs.db.updateTasks();
        bs.events.statuses.onSet(sObject);
    }

    request.onerror = function(e){
        bs.alert(e.value, "bs.db.setStatus() onerror");
    };
}

bs.db.updateStatuses = function(){
    bs.db.getDBData(bs.db.statusesName());
    bs.events.statuses.onUpdate({});
};

bs.db.findStatusByID = function(sID){
    var statusData = bs.db.data()[bs.db.statusesName()]();//Get bs.db.data[statuses] for future use
    var statusDataKey = undefined;
    $.each(statusData, function(key, value){
        if(value.getID() == sID){
            statusDataKey = key;
        }
    });

    return statusDataKey;
};

/********************* Task Object *********************/
function task(sID, sSummary, sStatus){
    var self = this;
    self.id = ko.observable();
    self.summary = ko.observable();
    self.status = ko.observable();
    self.lastMod = ko.observable();


    /* Getters */
    self.getID = function(){
        return self.id();
    };

    self.getSummary = function(){
        return self.summary();
    };

    self.getStatus = function(){
        return self.status();
    };

    self.getLastMod = function(){
        return self.lastMod();
    };

    self.getDump = function(){
        return { "id": self.getID(), "summary": self.getSummary(), "status": self.getStatus().getDump(), "lastMod": self.getLastMod() };
    };


    /* Setters */
    self.setID = function(sID){
        self.id(sID);
        self.updateLastMod();
    };

    self.setSummary = function(sSummary){
        self.summary(sSummary);
        self.updateLastMod();
    };

    self.setStatus = function(sStatus){
        self.status(sStatus);
        self.updateLastMod();
    };

    self.setLastMod = function(sLastMod){
        self.lastMod(sLastMod);
        self.updateLastMod();
    };

    self.updateLastMod = function(){
        self.lastMod(Date.now());
    };

    self.set = function(sIndex, sValue){
        if( typeof self[sIndex] == 'function'){//If sIndex is a ko.observable
            self[sIndex](sValue);
        } else{
            self[sIndex] = sValue;
        }
        self.updateLastMod();
    };

    if(typeof sID == 'object'){//If pure object is inputed
        $.each(sID, function(key, value){
            self.set(key, value);
        });
    } else if(typeof sID == 'number'){//If parameters are inputed
        self.id = ko.observable(sID);
        self.summary = ko.observable(sSummary);

        if(typeof sStatus == 'object'){
            self.status = ko.observable(new status(sStatus));
        } else if(typeof sStatus == 'number'){
            self.status = ko.observable(new status(bs.db.data()[bs.db.statusesName()]()[sStatus]));
        }else if(typeof sStatus == "function"){
            self.status = ko.observable(bs.db.data()[bs.db.statusesName()]()[sStatus]);
        } else{
            bs.alert("A valid status must be suplied in setting a task", "task constructor", true);
            return;
        }
    }

    self.lastMod = ko.observable(Date.now());
};


/********************* Status Object *********************/
function status(sID, sDisplayName, sShared, sColor){
    var self = this;
    self.id = ko.observable();
    self.displayName = ko.observable();
    self.color = ko.observable();
    self.shared = ko.observable();
    self.lastMod = ko.observable();

    /* Getters */
    self.getID = function(){
        return self.id();
    };

    self.getDisplayName = function(){
        return self.displayName();
    };

    self.getColor = function(){
        return self.color();
    };

    self.getShared = function(){
        return self.shared();
    };

    self.getLastMod = function(){
        return self.lastMod();
    };

    self.getDump = function(){
        return { "id": self.getID(), "displayName": self.getDisplayName(), "color": self.getColor(), "shared": self.getShared(), "lastMod": self.getLastMod() };
    };


    /* Setters */
    self.setID = function(sID){
        self.id(sID);
        self.updateLastMod();
    };

    self.setDisplayName = function(sDisplayName){
        self.displayName(sDisplayName);
        self.updateLastMod();
    };

    self.setColor = function(sColor){
        self.color(sColor);
        self.updateLastMod();
    };

    self.setShared = function(sShared){
        self.shared(sShared);
        self.updateLastMod();
    };

    self.setLastMod = function(sLastMod){
        self.lastMod(sLastMod);
        self.updateLastMod();
    };

    self.updateLastMod = function(){
        self.lastMod(Date.now());
    };

    self.set = function(sIndex, sValue){
        if( typeof self[sIndex] == 'function'){//If sIndex is a ko.observable
            self[sIndex](sValue);
        } else{
            self[sIndex] = sValue;
        }
        self.updateLastMod();
    };

    if(typeof sID == "object"){
        $.each(sID, function(key, value){
            self.set(key, value);
        });
    } else if(typeof sID == "number"){
        self.id = ko.observable(sID);
        self.displayName = ko.observable(sDisplayName);
        self.color = ko.observable(sColor)
        self.shared = ko.observable(sShared);
        self.lastMod = ko.observable(Date.now());
    }
};


/* Toggle Switch Class */
bs.toggleSwitch = function(selector, optionalAction){
        var self = this;
    /* Adds in semantic html */
    $(document).ready(function(){
        $(selector).html('<div class="switchSlider"><div class="switchOn switchState">ON</div><div class="switchOff switchState">OFF</div></div>');
        $(selector).attr('data-state', 'false');
        $(selector).addClass('noSelect');
   
    
        $(selector + ' .switchSlider').transition({ x: -40});
        
        this.state = $(selector).attr('data-state');
        
        $(selector).click(function(){
            switch($(this).attr('data-state')){
                case "true"://Turning off
                    $('.switchSlider').transition({ x: -41});
                    $(this).attr('data-state', 'false');
                break;
                
                case "false"://Turning on
                    $('.switchSlider').transition({ x: 0});
                    $(this).attr('data-state', 'true');
                break;
                
                default://Turning off
                    $('.switchSlider').transition({ x: -41});
                    $(this).attr('data-state', 'false');
                break;
            }
            
            this.state = $(selector).attr('data-state');
            
            if (typeof optionalAction === 'undefined') {
            
            }else{
                optionalAction(this);   
            }
        });
        self.setState("false");
    });
    
    this.setState = function(newState){
        this.state = newState;
        $(this).attr('data-state', newState);
        
        if(newState == "true"){
            $('.switchSlider').transition({ x: 0});
        }
        if(newState == "false"){
            $('.switchSlider').transition({ x: -41});
        }
    };
}