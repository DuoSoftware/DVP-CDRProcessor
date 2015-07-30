module.exports = function(sequelize, DataTypes) {
    var AutoAttendantAction = sequelize.define('CSDB_AutoAttendantAction', {
            ON: DataTypes.STRING
        }
    );

    return AutoAttendantAction;
};

