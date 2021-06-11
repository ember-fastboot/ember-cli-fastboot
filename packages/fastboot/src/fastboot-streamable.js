
const stream = require('stream');

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Fastboot streamer.
 * This class an example of how the users can leverage the
 * base streamable apis for streaming the content.
 */
class FastBootStream extends stream.Readable {
  constructor(context, url) {
    super();
  
    this.fastboot = context.fastboot;
    this.options = context.options;
    this.url = url;
  }
  _read(){

  }

  async stream() {
    await this.body();
    this.push(null);
  }
  /**
   * This function represents the fastboot.visit operation.
   * The datalets can be pushed to the stream while the visit promise
   * is being resolved. At the end, push the content of the body to the stream.
   * @returns
   */
  async body() {
    const response = await this.fastboot.visit(this.url, Object.assign({}, this.options, {metadata: {streamer: this}}));
    // this.push('<script type="x/boundary" class="fake-shoebox-end"></script>');
    
    const bodyData = `<script type="x/boundary" id="fastboot-body-start"></script>${response.domContents().body}<script type="x/boundary" id="fastboot-body-end"></script>`;
    this.push(bodyData);
  }
}

module.exports = FastBootStream;
