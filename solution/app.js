const fs = require('fs');
const app = require('express')();
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");

var user_data;

var serialize = (data) => {
    data = data.split(';');

    data = data.map(function(value, index, array) {
        var credentials = value.split(':');
        return { user_name: credentials[0], hashedPassword: credentials[1] };
    });

    return data;
}

var deserialize = (data) => {
    data = data.map(function (value, index, array) {
        return value.user_name + ":" + value.hashedPassword;
    });

    return data.join(';');
}

var load_data = (file_name) => {
    user_data = serialize(fs.readFileSync(file_name, 'utf-8'));
};

var user_exist = (user_name) => {
    for (var i = 0; i < user_data.length; ++i) {
        if (user_data[i].user_name === user_name) {
            return true;
        }
    }

    return false;
}

var add_user = (file_name, user_name, hashedPassword) => {
    user_data.push({ user_name, hashedPassword });
    var serializedData = user_name + ':' + hashedPassword;
    if (user_data.length === 0) {
        fs.appendFileSync(file_name, serializedData, 'utf-8');
    } else {
        fs.appendFileSync(file_name, ';' + serializedData, 'utf-8');
    }
}

var save_data = (file_name) => {
    fs.writeFileSync(file_name, deserialize(user_data));
}

app.use(bodyParser.json());

app.post("/user/create", async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const hashedPassword = await bcrypt.hash(password, 12);

    if (!user_exist(email)) {
        add_user('user_data', email, hashedPassword);
        res.send("OK");
    } else {
        res.send("User already exist");
    }
});

app.post("/user/login", async (req, res, next) => {
    console.log(req.body);
    /*
    const username = 'sample'
    const password = 'password'
    const hashedPw = await bcrypt.hash(password, 12);
    const user = await User.create({username, hashedPw})
    await user.save();
    return res.send(user);
     */
});

app.get('/btcRate', async (req, res) => {

});

app.listen(3000,  () => {
    load_data("user_data");
    console.log("server running on port 3000");
});
