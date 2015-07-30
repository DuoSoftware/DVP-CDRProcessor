module.exports = function(sequelize, DataTypes) {
    var CallCDR = sequelize.define('CSDB_CallCDR',
        {
            Uuid: {type: DataTypes.STRING, primaryKey: true},
            CallUuid: DataTypes.STRING,
            BridgeUuid: DataTypes.STRING,
            SipFromUser: DataTypes.STRING,
            SipToUser: DataTypes.STRING,
            HangupCause: DataTypes.STRING,
            Direction: DataTypes.STRING,
            SwitchName: DataTypes.STRING,
            CallerContext: DataTypes.STRING,
            IsAnswered: DataTypes.BOOLEAN,
            CreatedTime: DataTypes.DATE,
            AnsweredTime: DataTypes.DATE,
            BridgedTime: DataTypes.DATE,
            HangupTime: DataTypes.DATE,
            Duration: DataTypes.INTEGER,
            BillSec: DataTypes.INTEGER,
            HoldSec: DataTypes.INTEGER,
            ProgressSec: DataTypes.INTEGER,
            AnswerSec: DataTypes.INTEGER,
            WaitSec: DataTypes.INTEGER,
            ProgressMediaSec: DataTypes.INTEGER,
            FlowBillSec: DataTypes.INTEGER,
            ObjClass: DataTypes.STRING,
            ObjType: DataTypes.STRING,
            ObjCategory: DataTypes.STRING,
            AppId: DataTypes.INTEGER,
            CompanyId: DataTypes.INTEGER,
            TenantId: DataTypes.INTEGER
        }

    );


    return CallCDR;
};