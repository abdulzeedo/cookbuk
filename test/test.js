const chai = require('chai');
const chaiHttp = 'chai-http';
const app = '../src/RecipesLambda';

chai.use(chaiHttp);
chai.should();

describe("Recipes", () => {
  describe("GET /", () => {
      // Test to get all students record
      it("should get all recipes", (done) => {
           chai.request(app)
               .get('/recipes')
               .end((err, res) => {
                   res.should.have.status(200);
                   res.body.should.be.a('object');
                   done();
                });
       });
      // Test to get single student record
      it("should get a single student record", (done) => {
           const id = 1;
           chai.request(app)
               .get(`/${id} `)
               .end((err, res) => {
                   res.should.have.status(200);
                   res.body.should.be.a('object');
                   done();
                });
       });
       
      // Test to get single student record
      it("should not get a single student record", (done) => {
           const id = 5;
           chai.request(app)
               .get(`/${id}`)
               .end((err, res) => {
                   res.should.have.status(404);
                   done();
                });
       });
  });
});