module.exports = function(sequelize, DataTypes) {
    var TrunkPhoneNumber = sequelize.define('CSDB_PhoneNumbers', {
            PhoneNumber: DataTypes.STRING,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING, //CALL, FAX
            ObjCategory: DataTypes.STRING, //INBOUND, OUTBOUND, BOTH
            Enable: DataTypes.BOOLEAN,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            FaxType: DataTypes.STRING
        }
    );


    return TrunkPhoneNumber;
};