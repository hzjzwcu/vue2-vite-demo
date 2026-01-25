<template>
  <div id="cy" style="width: 100%; height: 400px;"></div>
</template>

<script>
import cytoscape from 'cytoscape';

export default {
  name: 'CytoscapeDemo',
  mounted() {
    this.initCytoscape();
  },
  methods: {
    initCytoscape() {
      cytoscape({
        container: document.getElementById('cy'),
        elements: [
          { data: { id: 'a' } },
          { data: { id: 'b' } },
          {
            data: { id: 'ab', source: 'a', target: 'b' }
          }
        ],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#666',
              'label': 'data(id)'
            }
          },
          {
            selector: 'edge',
            style: {
              'width': 3,
              'line-color': '#ccc',
              'target-arrow-color': '#ccc',
              'target-arrow-shape': 'triangle'
            }
          }
        ],
        layout: {
          name: 'grid',
          rows: 1
        }
      });
    }
  }
};
</script>
