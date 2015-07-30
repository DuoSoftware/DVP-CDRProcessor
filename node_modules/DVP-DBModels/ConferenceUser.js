module.exports = function(sequelize, DataTypes) {
    var ConferenceUser = sequelize.define('CSDB_ConferenceUser', {
            ActiveTalker: DataTypes.BOOLEAN,
            Def: DataTypes.BOOLEAN,
            Mute: DataTypes.BOOLEAN,
            Mod: DataTypes.BOOLEAN,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,//OutBound/Inbound
            ObjCategory: DataTypes.STRING,//Internal/External
            CurrentDef:DataTypes.BOOLEAN,
            CurrentMute:DataTypes.BOOLEAN,
            CurrentMod:DataTypes.BOOLEAN,
            Destination:DataTypes.STRING,//Phonenumber
            JoinType:DataTypes.STRING,//In/Out
            UserStatus: DataTypes.STRING //

        }
    );


    return ConferenceUser;
};
