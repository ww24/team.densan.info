/**
 * Profile Settings
 *
 */
/* globals Vue, Materialize */

(function () {
  var vm = new Vue({
    el: "main",
    data: {
      token: "",
      email: ""
    },
    ready: function () {
      var data = this.$data;
      var teams = data.team.split(",");
      Object.keys(data).filter(function (key) {
        return key.slice(0, 5) === "team_" && !~ teams.indexOf(key.slice(5));
      }).forEach(function (key) {
        data[key] = false;
      });
    },
    methods: {
      save: function (event) {
        event.preventDefault();

        var $form = $(event.target);
        var data = {
          _csrf: vm.$data.token,
          email: vm.$data.email,
          team: []
        };

        data.team = $form.serializeArray().filter(function (input) {
          return input.name === "team";
        }).map(function (input) {
          return input.value;
        });

        $.ajax({
          method: $form.attr("method"),
          url: $form.attr("action"),
          data: JSON.stringify(data),
          dataType: "json",
          contentType: "application/json"
        }).done(function (data) {
          console.log(data);
          Materialize.toast("Saved.", 3000);
        }).fail(function (xhr) {
          var res = JSON.parse(xhr.responseText);
          console.error(res);
          Materialize.toast("⚠error", 3000);
        });
      }
    }
  });
})();

$(function () {
  $("select").material_select();
});
