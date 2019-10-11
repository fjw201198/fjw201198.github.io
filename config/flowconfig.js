var flowconfig = {
    'x': 0,
    'y': 0,
    'line-width': 1,
    'line-length': 30,
    'text-margin': 10,
    'font-size': 14,
    'font-color': 'black',
    'line-color': 'black',
    'element-color': 'black',
    'fill': 'white',
    'yes-text': '是',
    'no-text': '否',
    'arrow-end': 'block',
    'scale': 1,
    // even flowstate support ;-)
    'flowstate' : {
        'past' : { 'font-size' : 12},
        'current' : {'font-weight' : 'bold'},
        'approved' : {'font-size' : 10, 'yes-text' : 'APPROVED', 'no-text' : 'n/a' },
        'rejected' : {'font-size' : 10, 'yes-text' : 'n/a', 'no-text' : 'REJECTED' }
    }
}
