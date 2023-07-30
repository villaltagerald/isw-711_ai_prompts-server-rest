const { Configuration, OpenAIApi } = require("openai");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
});

/**
 * Executes prompt
 *
 * @param {*} req
 * @param {*} res
 */
const executePrompt = async (req, res) => {
  const openai = new OpenAIApi(configuration);
  const response = await openai.listModels();

  res.status(200); // CREATED

  res.json(response);

};

const createImage = async (req, res) => {
  if (req.body.instruction && req.body.imagesize) {
    const { OpenAIApi } = require("openai");
    const openai = new OpenAIApi(configuration);
    const response = await openai.createImage({
      prompt: req.body.instruction,
      n: req.body.responseCount,
      size: req.body.imagesize,
    });
    if (response) {
      const respon = response.data.data.map(({ url }) => url)
      res.status(201); // CREATED
      res.json(respon);
    } else {
      res.status(422);
      res.json({
        message: "There was an error executing the open AI method"
      })
    }
  } else {
    res.status(422);
    res.json({
      message: "Information is missing"
    })
  }
}

const createEdit = async (req, res) => {
  if (req.body.input && req.body.instruction) {
      const { OpenAIApi } = require("openai");
      const openai = new OpenAIApi(configuration);
      const response = await openai.createEdit({
        model: "text-davinci-edit-001",
        input: req.body.input,
        instruction: req.body.instruction,
        n: req.body.responseCount,
        temperature: req.body.temperature,
      });
      if (response) {
        const respon = response.data.choices.map((choice) => choice.text);
        res.status(201); // CREATED
        res.json(respon);
      } else {
        res.status(422);
        res.json({
          message: "There was an error executing the open AI method"
        })
      }
    }else {
      res.status(422);
      res.json({
        message: "Information is missing"
      })
    }
}

const createCompletition = async (req, res) => {
  console.log(req.body)
  if (req.body.instruction ) {
      const { OpenAIApi } = require("openai");
      const openai = new OpenAIApi(configuration);
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: req.body.instruction,
        n: req.body.responseCount,
        temperature: req.body.temperature,
      });
      if (response) {
        const respon = response.data.choices.map((choice) => choice.text);
        res.status(201); // CREATED
        res.json(respon);
      } else {
        res.status(422);
        res.json({
          message: "There was an error executing the open AI method"
        })
      }
    }else {
      res.status(422);
      res.json({
        message: "Information is missing"
      })
    }
}

module.exports = {
  executePrompt,
  createImage,
  createEdit,
  createCompletition
}