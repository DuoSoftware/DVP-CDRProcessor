/**
 * Created by Pawan on 6/3/2015.
 */
module.exports = function(sequelize, DataTypes) {
    var DialedCampaignPhones = sequelize.define('CSDB_DialedCampaignPhones', {
            Phone: DataTypes.STRING,
            CampaignId: DataTypes.INTEGER,
            DisconnectReason:DataTypes.STRING


        }
    );


    return DialedCampaignPhones;
};
