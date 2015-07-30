/**
 * Created by Pawan on 6/1/2015.
 */
module.exports = function(sequelize, DataTypes) {
    var Campaign = sequelize.define('CSDB_Campaign', {
            CampaignName: DataTypes.STRING,
            CampaignNumber: DataTypes.STRING,
            ConcurrentLimit:DataTypes.INTEGER,
            Max:DataTypes.INTEGER,
            Min:DataTypes.INTEGER,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER,
            Class: DataTypes.STRING,
            Type: DataTypes.STRING,
            Category: DataTypes.STRING,
            StartTime: DataTypes.DATE,
            EndTime:DataTypes.DATE,
            Enable:DataTypes.BOOLEAN,
            ScheduleId: DataTypes.STRING,
            Limit:DataTypes.INTEGER,
            LastUpdate:DataTypes.STRING,
            CSID:DataTypes.STRING


        }
    );


    return Campaign;
};
