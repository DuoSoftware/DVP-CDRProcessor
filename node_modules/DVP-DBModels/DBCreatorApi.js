var sequelize = require('./index.js').SequelizeConn;

var createDB = function(forcefully, callback){
    sequelize
        .sync({ force: forcefully })
        .then(function(rsp)
        {
            console.log('It worked!');
            callback(null, true);
        })
        .catch(function(err)
        {
            console.log('An error occurred while creating the database:', err);
            callback(err, false);
        });
};

createDB(true, function(err, res){

    console.log(res);

});

