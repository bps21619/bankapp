const requests = [];

function createResetRequest(resetRequest) {
    requests.push(resetRequest);
    console.log(requests);
}

function getResetRequest(id) {
    const thisRequest = requests.find(req => req.id === id);
    return thisRequest;
}
var removeByAttr = function(arr, attr, value) {
    var i = arr.length;
    while (i--) {
        if (arr[i] && arr[i].hasOwnProperty(attr) && (arguments.length > 2 && arr[i][attr] === value)) {
            arr.splice(i, 1);
        }
    }
    return arr;
};

function deleteRequest(id) {
    removeByAttr(requests, 'id', id);
}
module.exports = {
    createResetRequest,
    getResetRequest,
    deleteRequest
};