function weightedMedian(values, weights) {

  var midpoint = 0.5 * sum(weights);

  var cumulativeWeight = 0;
  var belowMidpointIndex = 0;

  var sortedValues = [];
  var sortedWeights = [];

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
    return sum(bounds) / bounds.length;
  }

  return sortedValues[belowMidpointIndex - 1];
}

const median = arr => {
  const mid = Math.floor(arr.length / 2),
    nums = [...arr].sort((a, b) => a - b);
  return arr.length % 2 !== 0 ? nums[mid] : (nums[mid - 1] + nums[mid]) / 2;
};

const sum = (arr: number[]) : number => {
	let total = 0
    arr.forEach(val => {
        total += val
    })
    return total
}

const arrayAvg = (arr: number[]) : number => {
    return arr.reduce((x,y) => x + y)/arr.length;
}

const zip = <S,T>(xs : S[], ys : T[]):Array<[S,T]> => {
    return xs.map((e, i) =>[e, ys[i]]);
};

const unzip = <S,T>(arr : Array<[S,T]>):[S[], T[]] => {
    let a = [];
    let b = [];
    arr.forEach(e => {
        a.push(e[0]);
        b.push(e[1])
    })
    return [a, b];
}

export { weightedMedian, median, zip, unzip, arrayAvg };