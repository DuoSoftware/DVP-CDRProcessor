module.exports = function(sequelize, DataTypes) {
    var DVPEvent = sequelize.define('CSDB_DVPEvent', {
            SessionId: DataTypes.STRING,
            EventName: DataTypes.STRING,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            EventClass: DataTypes.STRING,
            EventType: DataTypes.STRING,
            EventCategory: DataTypes.STRING,
            EventTime: DataTypes.DATE,
            EventData: DataTypes.STRING,
            EventParams: DataTypes.STRING(10000)
        }
    );


    return DVPEvent;
};

/*

EVENT CLASS
-----------

 CALL
 APP
 RULE

EVENT TYPES
-------------

EVENT, COMMAND

EVENT CATEGORIES
-----------------

SYSTEM, DEVELOPER


EVENT NAME
-----------------

PLAYFILE, ANSWER, DATAERROR


 */
