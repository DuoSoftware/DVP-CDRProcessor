module.exports = function(sequelize, DataTypes) {
    var IPAddress = sequelize.define('CSDB_IPAddress', {
            MainIp: DataTypes.STRING,
            IP: {type: DataTypes.STRING, unique: true},
            IsAllocated: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false}
        }
    );


    return IPAddress;
};