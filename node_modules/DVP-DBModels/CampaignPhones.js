/**
 * Created by Pawan on 6/3/2015.
 */

module.exports = function(sequelize, DataTypes) {
    var CampaignPhones = sequelize.define('CSDB_CampaignPhones', {
            Phone: DataTypes.STRING,
            CampaignId: DataTypes.STRING,
            Enable:DataTypes.BOOLEAN,
            Class: DataTypes.STRING,
            Type: DataTypes.STRING,
            Category: DataTypes.STRING


        }
    );


    return CampaignPhones;
};
