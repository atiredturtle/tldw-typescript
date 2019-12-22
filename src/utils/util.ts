import * as _ from 'lodash';

function weightedMedian(values: number[], weights: number[]) {

  let midpoint = 0.5 * _.sum(weights);

  let cumulativeWeight = 0;
  let belowMidpointIndex = 0;

  let sortedValues: number[] = [];
  let sortedWeights: number[] = [];

  values.map(function (value, i) {

    return [value, weights[i]];
  }).sort(function (a, b) {

    return a[0] - b[0];
  }).map(function (pair) {

    sortedValues.push(pair[0]);
    sortedWeights.push(pair[1]);
  });

  if (sortedWeights.some(function (value) { return value > midpoint; })) {

    return sortedValues[sortedWeights.indexOf(Math.max.apply(null, sortedWeights))];
  }

  while (cumulativeWeight <= midpoint) {

    belowMidpointIndex++;
    cumulativeWeight += sortedWeights[belowMidpointIndex - 1];
  }

  cumulativeWeight -= sortedWeights[belowMidpointIndex - 1];

  if (cumulativeWeight - midpoint < Number.EPSILON) {

    var bounds = sortedValues.slice(belowMidpointIndex - 2, belowMidpointIndex);
    return _.sum(bounds) / bounds.length;
  }

  return sortedValues[belowMidpointIndex - 1];
}

const arrayAvg = (arr: number[]) : number => {
    return arr.reduce((x,y) => x + y)/arr.length;
}

export { weightedMedian, arrayAvg };