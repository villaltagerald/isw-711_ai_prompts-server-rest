const Prompts = require("../models/promptsModel");

/**
 * Creates a course
 *
 * @param {*} req
 * @param {*} res
 */
const promptsPost = async (req, res) => {
  let prompts = new Prompts(req.body);
  prompts.userId = req.user.userId;
  await prompts.save()
    .then(prompts => {
      res.status(201); // CREATED
      res.header({
        'location': `/api/prompts/?id=${prompts.id}`
      });
      res.json(prompts);
    })
    .catch(err => {
      res.status(422);
      console.log('error while saving the prompts', err);
      res.json({
        error: 'There was an error saving the prompts'
      });
    });
};

/**
 * Get all courses or one
 *
 * @param {*} req
 * @param {*} res
 */
const promptsGet = (req, res) => {
  // if an specific prompt is required
  if (req.query && req.query.id) {
    Prompts.findById(req.query.id)
      .then((prompts) => {
        res.json(prompts);
      })
      .catch(err => {
        res.status(404);
        console.log('error while queryting the prompts', err)
        res.json({ error: "Prompts doesnt exist" })
      });
  } else {
    // get all prompt
    // Accede a la información del token a través de req.user
    let userId = req.user.userId;
    Prompts.find({ userId: userId })
      .then(prompts => {
        res.json(prompts);
      })
      .catch(err => {
        res.status(422).json({ error: err });
      });
  }
};

/**
 * Updates a prompt
 *
 * @param {*} req
 * @param {*} res
 */

const promptsPatch = (req, res) => {
  // get prompt by id
  if (req.query && req.query.id) {
    Prompts.findById(req.query.id, function (err, prompts) {
      if (err) {
        res.status(404);
        console.log('error while querying the prompts', err);
        res.json({ error: "Prompts doesn't exist" });
      } else {

        // Update prompt properties
        prompts.name = req.body.name ? req.body.name : prompts.name;
        prompts.type = req.body.type ? req.body.type : prompts.type;
        prompts.tags = req.body.tags ? req.body.tags : prompts.tags;

        if (req.body.questions && req.body.questions._id) {
          // Find the question in prompts.questions and update its properties
          const questionId = req.body.questions._id;
          const questionIndex = prompts.questions.findIndex((question) => question._id.equals(questionId));
          if (questionIndex !== -1) {
            prompts.questions[questionIndex].responseCount = req.body.questions.responseCount;
            prompts.questions[questionIndex].input = req.body.questions.input;
            prompts.questions[questionIndex].instruction = req.body.questions.instruction;
            prompts.questions[questionIndex].temperature = req.body.questions.temperature;
            prompts.questions[questionIndex].imagesize = req.body.questions.imagesize;
            prompts.questions[questionIndex].response = req.body.questions.response;
            prompts.questions[questionIndex].timestamp = Date.now();
          } else {
            res.status(404);
            res.json({ error: "Question doesn't exist" });
            return;
          }
        } else if(req.body.questions && req.body.questions.instruction) {
          // Create new questions subdocument
          const newQuestion = {
            responseCount: req.body.questions.responseCount,
            input: req.body.questions.input,
            instruction: req.body.questions.instruction,
            temperature: req.body.questions.temperature,
            imagesize: req.body.questions.imagesize,
            response: req.body.questions.response,
            timestamp: Date.now()
          }
          // Add new question to prompts.questions
          prompts.questions.push(newQuestion);
        };
      }
      prompts.save(function (err) {
        if (err) {
          res.status(422);
          console.log('error while saving the prompts', err);
          res.json({
            error: 'There was an error saving the prompts'
          });
        } else {
          res.status(200); // OK
          res.json(prompts);
        }
      });
    }
    );
  } else {
    res.status(404);
    res.json({ error: "Prompts doesn't exist" });
  }
};



/**
 * Deletes a prompt
 *
 * @param {*} req
 * @param {*} res
 */
const promptsDelete = (req, res) => {
  // get prompt by id
  if (req.query && req.query.id) {
    Prompts.findById(req.query.id, function (err, prompts) {
      if (err) {
        res.status(404);
        console.log('error while queryting the prompts', err)
        res.json({ error: "Prompts doesnt exist" })
      }

      prompts.deleteOne(function (err) {
        if (err) {
          res.status(422);
          console.log('error while deleting the prompts', err)
          res.json({
            error: 'There was an error deleting the prompts'
          });
        }
        res.status(204); //No content
        res.json({});
      });
    });
  } else {
    res.status(404);
    res.json({ error: "Prompts doesnt exist" })
  }
};


module.exports = {
  promptsPost,
  promptsGet,
  promptsPatch,
  promptsDelete
}