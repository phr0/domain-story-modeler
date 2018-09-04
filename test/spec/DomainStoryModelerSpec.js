import TestContainer from 'mocha-test-container-support';

import DomainStoryModeler from '../../app/domain-story-modeler';

describe('domainStory modeler', function() {

  var jsonString = '[{"type":"domainStory:actorPerson","name":"","id":"shape_3050","x":178,"y":133,"width":30,"height":30},'+
  '{"type":"domainStory:workObject","name":"","id":"shape_8681","x":508,"y":133,"width":30,"height":30},'+
  '{"type":"domainStory:activity","name":"","id":"connection_3004","number":1,"waypoints":[{"original":{"x":216,"y":171},"x":259,"y":171},{"original":{"x":546,"y":171},"x":508,"y":171}],"source":"shape_3050","target":"shape_8681"},'+
  '{"info":"test"}]';
  var data = JSON.parse(jsonString);
  // remove the info tag at the end before we load the data
  data.pop();

  var container;

  beforeEach(function() {
    container = TestContainer.get(this);
  });

  describe('domainStory import export', function() {

    // since PhantomJS does not implement ES6 features we have to define our own string.includes method
    if (!String.prototype.includes) {
      String.prototype.includes = function() {'use strict';
        return String.prototype.indexOf.apply(this, arguments) !== -1;
      };
    }

    var modeler;

    // spin up modeler with custom element, do this only once, using before each takes too long and triggers the timeout
    modeler = new DomainStoryModeler({ container: container });
    modeler.importCustomElements(data, function(err) {
      if (err) {
        console.log(err);
      }
    });

    it('should import domainStory element', function() {

      // given
      var elementRegistry = modeler.get('elementRegistry');
      var domainStoryElements = modeler.getCustomElements();
      // when

      modeler.importCustomElements(domainStoryElements);
      var actorPersonImport = elementRegistry.get('shape_3050');

      domainStoryElements = modeler.getCustomElements();

      // then
      expect(actorPersonImport).to.exist;
      expect(domainStoryElements[0].id).to.contain(actorPersonImport.id);

    });

    it('should export domainStory element', function() {

      // given
      var domainStoryElements = modeler.getCustomElements();

      modeler.importCustomElements(domainStoryElements);

      // when
      var newObject= domainStoryElements.slice(0);
      newObject.push({ info: 'test' });
      var jsonExport=JSON.stringify(newObject);

      // then
      expect(jsonExport).to.eql(jsonString);
    });

    // we have to rebuild the basic functionality of the import function from app.js, because we cannot get access to the HTML
    it('should not import wrong file type',function() {

      // given
      var testData='[{"type":"domainStory:actorPerson","name":"","id":"shape_0001","x":178,"y":133,"width":30,"height":30}]';
      var elementRegistry = modeler.get('elementRegistry');
      var input = {
        name:'thisIsAName.wrongF.dstiletype',
        testData
      };
      var reader = new FileReader();

      // when
      if (input.name.endsWith('.dst')) {
        reader.onloadend = function(e) {
          var text = e.target.result;

          var elements = JSON.parse(text);
          elements.pop(); // to get rid of the info tag at the end

          modeler.importCustomElements(elements);
        };

        reader.readAsText(input);
      }

      // then
      var extraActor= elementRegistry.get('shape_0001');
      console.log(extraActor);
      expect(extraActor).to.not.exist;
    });
  });

});