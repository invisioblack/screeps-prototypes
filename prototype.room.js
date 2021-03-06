//let statsConsole = require("statsConsole");


let regexLeft = /[EW][0-9]{1,2}/;
let regexRight = /[NS][0-9]{1,2}/;

var offsets = [
    {x: -1, y: -1},
    {x: 0, y: -1},
    {x: 1, y: -1},
    {x: -1, y: 0},
    {x: 1, y: 0},
    {x: -1, y: 1},
    {x: 0, y: 1},
    {x: 1, y: 1}
];

module.exports = function () {

    /**
     * Returns the stored amount of energy in the room.
     * @returns {number|*}
     */
    Room.prototype.storedEnergyInRoom =
        function () {
            if (this._storedEnergyInRoom) {
                return this._storedEnergyInRoom;
            }
            let energySum = 0;
            let myStructures = this.find(FIND_STRUCTURES);
            for (var structureName in myStructures) {
                if (!myStructures.hasOwnProperty(structureName)) {
                    continue;
                }
                var structure = myStructures[structureName];
                if (structure.energy > 0) {
                    energySum += structure.energy;
                }
                if (structure.store && structure.store[RESOURCE_ENERGY] > 0) {
                    energySum += structure.store[RESOURCE_ENERGY];
                }
            }
            this._storedEnergyInRoom = energySum;
            return this._storedEnergyInRoom;
        };
    /**
     * Get the sources in this room.
     * @returns {*}
     */
    Room.prototype.getSources =
        function () {
            if (this._sources) {
                return this._sources;
            }
            this._sources = this.find(FIND_SOURCES);
            return this._sources;
        };
    /**
     * Find all of your creeps with the specified role.
     * @param role
     */
    Room.prototype.getLivingRoles = function (role) {
        let roleFilter =
            function (creep) {
                return creep.memory.role == role;
            };

        if (this._livingRoles) {
            return _.filter(this._livingRoles, roleFilter);
        }

        this._livingRoles = this.find(FIND_MY_CREEPS);

        return _.filter(this._livingRoles, roleFilter);
    };
    /**
     * Gets how many harvest points are around the sources you specify.
     * @param sources
     * @returns {*}
     */
    Room.prototype.getHarvestPoints =
        function (sources) {
            if (this.memory.harvestPoints === undefined) {
                let harvestPoints = 0;
                for (var sourceKey in sources) {
                    if (!sources.hasOwnProperty(sourceKey)) {
                        continue;
                    }
                    var source = sources[sourceKey];
                    var initial = source.pos;
                    for (var offsetKey in offsets) {
                        var offset = offsets[offsetKey];
                        var newPos = new RoomPosition(initial.x + offset.x, initial.y + offset.y, initial.roomName);
                        var terrain = Game.map.getTerrainAt(newPos);
                        if (terrain == "plain") {
                            harvestPoints++;
                        }
                        if (terrain == "swamp") {
                            harvestPoints++;
                        }
                    }
                }
                this.memory.harvestPoints = harvestPoints;
                return harvestPoints;
            } else {
                return this.memory.harvestPoints;
            }
        };
    /**
     * Gets the extensions in the room.
     * @returns {*}
     */
    Room.prototype.getExtensions =
        function () {
            if (this._extensions) {
                return this._extensions;
            }
            this._extensions = this.find(FIND_MY_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_EXTENSION;
                }
            }).length;
            return this._extensions;
        };
    /**
     * Gets the hostile creeps in the room.
     * @returns {*}
     */
    Room.prototype.getHostileCreeps =
        function () {
            if (this._hostiles) {
                return this._hostiles;
            }
            this._hostiles = this.find(FIND_HOSTILE_CREEPS);
            return this._hostiles;
        };
    /**
     * Gets the hostile structures in a room.
     * @returns {*}
     */
    Room.prototype.getHostileStructures =
        function () {
            if (this._hostile_structures) {
                return this._hostile_structures;
            }
            this._hostile_structures = this.find(FIND_HOSTILE_STRUCTURES);
            return this._hostile_structures;
        };
    /**
     * Get the mineral that is in this room
     * @returns {*}
     */
    Room.prototype.getMineral =
        function () {
            if (this._mineral) {
                return this._mineral;
            }
            this._mineral = this.find(FIND_MINERALS)[0];
            return this._mineral;
        };
    /**
     * Get the labs in this room
     * @returns {*}
     */
    Room.prototype.getLabs =
        function () {
            if (this._labs) {
                return this._labs;
            }
            this._labs = this.find(FIND_MY_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_LAB;
                }
            });
            return this._labs;
        };
    /**
     * Get the storage in this room, probably not needed.
     * @returns {*}
     */
    Room.prototype.getStorage = function () {
        if (this._storage) {
            return this._storage;
        }
        this._storage = this.pos.findClosestByRange(FIND_MY_STRUCTURES, {
            filter: function (structure) {
                if (structure.structureType == STRUCTURE_STORAGE && (_.sum(structure.store) < structure.storeCapacity)) {
                    return true;
                }
                return false;
            }
        });
        return this._storage;
    };
    /**
     * Get the towers in this room
     * @returns {*}
     */
    Room.prototype.getTowers =
        function () {
            if (this._towers) {
                return this._towers;
            }
            this._towers = this.find(FIND_MY_STRUCTURES, {
                filter: function (structure) {
                    return structure.structureType == STRUCTURE_TOWER
                }
            });
            return this._towers;
        };
    /**
     * Get the worker layers in this room, will also change it as needed depending on how much energy is stored.
     * @returns {number}
     */
    Room.prototype.getWorkerLayers =
        function () {
            if (!Memory.rooms[this.name].workerLayers) {
                Memory.rooms[this.name].workerLayers = 1;
            }
            // Burn energy if we have excess
            if (this.storedEnergyInRoom() > 600000) {
                Memory.rooms[this.name].workerLayers = 2;
            } else if (this.storedEnergyInRoom() < 400000) {
                Memory.rooms[this.name].workerLayers = 1;
            }
            return Memory.rooms[this.name].workerLayers;
        };
    /**
     * Get idle spawns
     * @returns {*}
     */
    Room.prototype.getIdleSpawn =
        function () {
            return this.find(FIND_MY_SPAWNS, {
                filter: function (spawn) {
                    return spawn.spawning === null;
                }
            })
        };
    /**
     * Save the amount harvested for this tick
     * @param num
     */
    Room.prototype.saveHarvestedEnergy =
        function (num) {
            if (this._harvestedEnergy) {
                this._harvestedEnergy = this._harvestedEnergy + num;
            } else {
                this._harvestedEnergy = num;
            }
        };
    /**
     * Get how much energy was harvested, preferred at the end of main.js for stats
     * @returns {*}
     */
    Room.prototype.getHarvestedEnergy =
        function () {
            if (this._harvestedEnergy) {
                return this._harvestedEnergy;
            }
            return 0;
        };
    /**
     * Save the amount of energy used
     * @param num
     */
    Room.prototype.saveUsedEnergy =
        function (num) {
            if (this._usedEnergy) {
                this._usedEnergy = this._usedEnergy + num;
            } else {
                this._usedEnergy = num;
            }
        };
    /**
     * Get how much energy was used, preferred at the end of main.js for stats
     * @returns {*}
     */
    Room.prototype.getUsedEnergy =
        function () {
            if (this._usedEnergy) {
                return this._usedEnergy;
            }
            return 0;
        };
    /**
     * Replacement for a creep depositing a resource into the storage
     * @param creep
     * @param resource
     * @returns {*}
     */
    Room.prototype.depositResource =
        function (creep, resource = RESOURCE_ENERGY) {
            let total = creep.carry[resource];
            let message = creep.transfer(this.storage, resource);
            if (message == OK && resource == RESOURCE_ENERGY) {
                this.saveHarvestedEnergy(total);
            }
            return message;
        };
    /**
     * Replacement for a creep withdrawing a resource from the storage
     * @param creep
     * @param resource
     * @returns {*}
     */
    Room.prototype.withdrawResource =
        function (creep, resource = RESOURCE_ENERGY) {
            let message = creep.withdraw(this.storage, resource);
            if (message == OK && resource == RESOURCE_ENERGY) {
                this.saveUsedEnergy(creep.carry[resource]);
            }
            return message;
        };
    /**
     * Garbage Collect - set used variables to undefined
     */
    Room.prototype.gc =
        function () {
            this._storedEnergyInRoom = undefined;
            this._sources = undefined;
            this._extensions = undefined;
            this._hostiles = undefined;
            this._hostile_structures = undefined;
            this._mineral = undefined;
            this._labs = undefined;
            this._usedEnergy = undefined;
            this._towers = undefined;
            this._storage = undefined;
            this._storedEnergyInRoom = undefined;
            this._harvestedEnergy = undefined;
            this.lastInit = Game.time;
        };
};