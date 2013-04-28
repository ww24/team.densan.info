/**
 * New Controller
 */

module.exports = function (context) {
  var app = context.app,
      router = context.router,
      model = context.model,
      Validator = context.Validator;

  router.post(2, "/new", function (req, res) {
    // check XHR
    if (! req.xhr)
      return res.json(400, {message: "Bad Request"});

    // check logged in
    if (! req.user)
      return res.json(401, {message: "Unauthorized"});
    if (req.user.status !== "new")
      return res.json(403, {message: "Forbidden"});

    model.Team.getNameList(function (err, teams) {
      if (err)
        console.log(err);

      res.locals.teams = teams;

      model.Role.findOne({name: "member"}, function (err, role) {
        if (err)
          console.log(err);

        req.user.role = role;

        req.user.team = [];
        var team = req.body.team0;
        for (var i = 0; team; team = req.body["team" + (++i)])
          req.user.team[i] = team;

        var queries = req.user.team.map(function (team) {
          return {name: team};
        });

        model.Team
          .find()
          .or(queries)
          .exec(function (err, team) {
            if (err)
              console.log(err);

            req.user.team = team;
            req.user.email = req.body.email;
            req.user.timestamp = Date.now();

            var user = new model.User(req.user);
            user.save(function (err) {
              if (err) {
                var errs = [];
                for (var error in err.errors)
                  errs.push(err.errors[error].type);

                res.json(400, {message: "Error", errors: errs});
                return console.log(err);
              }

              req.user.status = "ok";

              res.json({message: "OK"});
            });
          });
      });
    });
  });
};