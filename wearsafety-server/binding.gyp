{
  'variables' : {
    'target_arch': 'x64'
  },
  'targets': [
    {   
      'target_name': 'contextify',
      'sources': [ 'src/contextify.cc' ],
      'cflags': ['-fPIC']
    }   
  ]
}