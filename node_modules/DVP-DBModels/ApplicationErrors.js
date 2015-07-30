/**
 * Created by pawan on 4/22/2015.
 */


module.exports = function(sequelize, DataTypes) {
    var ApplicationErrors = sequelize.define('CSDB_ApplicationErrors', {
            VoiceAppID: DataTypes.INTEGER,
            Code: DataTypes.STRING,
            Message:DataTypes.STRING,
            URL: DataTypes.STRING,
            SessionID:DataTypes.STRING

        }
    );


    return ApplicationErrors;
};

