/**
 * Created by Rajinda on 6/29/2015.
 */



module.exports = function(sequelize, DataTypes) {
    var CampOngoingCampaign = sequelize.define('DB_CAMP_OngoingCampaign', {
            CampaignId: DataTypes.INTEGER,
            CampaignState: DataTypes.STRING,
            LastResponsTime:DataTypes.DATE,
            DialerId:DataTypes.STRING
        }
    );
    return CampOngoingCampaign;
};