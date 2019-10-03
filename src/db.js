const mongoose = require('mongoose');

const mockgooseUri = process.env.NODE_ENV === 'test' ? 'mockgoose_fake_uri' : null;

const connect = () => {

    return new Promise((resolve, reject) => {

        if (process.env.NODE_ENV === 'test') {
            const Mockgoose = require('mockgoose').Mockgoose;
            const mockgoose = new Mockgoose(mongoose);

            mockgoose.prepareStorage()
                .then(() => {
                    mongoose.connect(
                        mockgooseUri,
                        {
                            useNewUrlParser: true,
                            useUnifiedTopology: true
                        }
                    )
                        .then((res, err) => {
                            if (err)
                                return reject(err);
                            resolve({
                                uri: mockgooseUri,
                                response: res
                            });
                        })
                });
        }
        else {
            mongoose.connect(
                process.env.MONGO_URI,
                {
                    useNewUrlParser: true,
                    useUnifiedTopology: true
                }
            )
                .then((res, err) => {
                    if (err)
                        return reject(err);
                    resolve({
                        uri: process.env.MONGO_URI,
                        response: res
                    });
                });
        }
    });
};

const close = () => {
    if (mockgooseUri)
        return Promise.resolve({ uri: mockgooseUri });
    return mongoose.connection.close();
};

module.exports = {
    connect,
    close
};