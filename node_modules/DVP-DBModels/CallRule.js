module.exports = function(sequelize, DataTypes) {
    var CallRule = sequelize.define('CSDB_CallRule', {
            CallRuleDescription: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            Enable: DataTypes.BOOLEAN,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            DNIS: DataTypes.STRING,
            ANI: DataTypes.STRING,
            DNISRegEx: DataTypes.STRING,
            ANIRegEx: DataTypes.STRING,
            RegExPattern: DataTypes.STRING, //STARTWITH, EXACTMATCH, ANY, CUSTOM
            ANIRegExPattern: DataTypes.STRING, //STARTWITH, EXACTMATCH, ANY, CUSTOM
            TrunkId: DataTypes.INTEGER,
            TrunkNumber: DataTypes.STRING,
            ExtraData: DataTypes.STRING,
            Priority: DataTypes.INTEGER,
            ContextRegEx: DataTypes.STRING,
            Context: DataTypes.STRING,
            Direction: DataTypes.STRING //INBOUND, OUTBOUND

        }
    );

    return CallRule;
};