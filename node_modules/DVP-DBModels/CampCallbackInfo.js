/**
 * Created by Rajinda on 6/29/2015.
 */




module.exports = function(sequelize, DataTypes) {
    var CampCallbackInfo = sequelize.define('DB_CAMP_CallbackInfo', {
            CampaignId: {type:DataTypes.INTEGER,unique: 'CampCallbackInfoCompositeIndex'},
            ContactId: {type:DataTypes.STRING,unique: 'CampCallbackInfoCompositeIndex'},
            DialoutTime:DataTypes.DATE,
            CallBackCount:DataTypes.INTEGER,
            CallbackStatus:DataTypes.BOOLEAN,
            Class: DataTypes.STRING,
            Type: DataTypes.STRING,
            Category: DataTypes.STRING,
            CallBackId:{type:DataTypes.INTEGER, primaryKey:true,autoIncrement: true}

        }
    );
    return CampCallbackInfo;
};