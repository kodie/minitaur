/*!
  minitaur v0.0.2 (https://github.com/kodie/minitaur)
  by Kodie Grantham (https://kodieg.com)
*/

var minitaurDebug = (typeof window.minitaurDebug === 'undefined') ? false : window.minitaurDebug

var minitaur = function (mount, options) {
  var elements = []
  var modals = []

  if (mount && mount.constructor === Object) {
    options = mount
    mount = null
  }

  options = minitaur.mergeObjects(minitaur.defaultOptions, options || {})

  if (!mount) mount = options.mount

  if (typeof mount === 'string') {
    elements = document.querySelectorAll(mount)
  } else if (mount instanceof HTMLElement) {
    elements = [mount]
  } else if (!mount) {
    elements = [document.createElement('div')]
  }

  elements = minitaur.getModals(elements)

  if (elements && elements.length) {
    for (var i = 0; i < elements.length; i++) {
      (function (modal) {
        if (modal.minitaur) {
          return true
        }

        if (options.beforeInit && options.beforeInit(modal) === false) {
          return false
        }

        minitaur.modalCount++

        var funcs = {
          close: function (options) {
            return minitaur.close(modal, options)
          },
          get: function (parseBreakpoints) {
            return minitaur.get(modal, parseBreakpoints, false)
          },
          kill: function (putBack) {
            return minitaur.kill(modal, putBack)
          },
          open: function (options) {
            return minitaur.open(modal, options)
          },
          set: function (options, value) {
            return minitaur.set(modal, options, value)
          },
          toggle: function (options) {
            return minitaur.toggle(modal, options)
          }
        }

        var opts = minitaur.parseOptions(minitaur.mergeObjects(options, minitaur.parseAttributes(modal.dataset), funcs, {
          isOpen: false
        }))

        if (modal.parentNode && modal.parentNode !== document.body) {
          opts.originalElement = modal.cloneNode(true)
          opts.originalElementIndex = Array.prototype.indexOf.call(modal.parentNode.childNodes, modal)
          opts.originalElementParent = modal.parentNode
          modal.parentNode.removeChild(modal)
        }

        modal.minitaur = opts
        modal.setAttribute('data-minitaur', '')

        opts = minitaur.get(modal, true, false)

        if (opts.id) {
          modal.id = opts.id
        } else if (!modal.id) {
          modal.id = 'minitaur-' + minitaur.modalCount
        }

        if (minitaurDebug) console.log('minitaur.init (#' + modal.id + '):', opts)

        if (opts.class) {
          if (typeof opts.class === 'string') {
            opts.class = [opts.class]
          }

          for (var c = 0; c < opts.class.length; c++) {
            modal.classList.add(opts.class[c])
          }
        }

        minitaur.setStyle(modal, minitaur.mergeObjects(opts.style || {}, opts.closeStyle || {}))
        minitaur.initiateTriggers(modal)

        if (!modal.parentNode) {
          document.body.appendChild(modal)
        }

        if (opts.opened) {
          modal.minitaur.open()
        } else {
          modal.minitaur.close()
        }

        if (opts.afterInit) {
          options.afterInit(modal)
        }

        modals.push(modal)
      })(elements[i])
    }
  }

  if (!minitaur.initiated) {
    minitaur.initiated = true

    document.addEventListener('click', minitaur.documentClick)
    window.addEventListener('resize', minitaur.documentResize)
    window.addEventListener('scroll', minitaur.documentScroll)
  }

  if (modals.length) {
    if (modals.length === 1) {
      return modals[0]
    }

    return modals
  }

  return false
}

minitaur.initiated = false
minitaur.modalCount = 0

minitaur.defaultOptions = {
  afterClose: null,
  afterInit: null,
  afterOpen: null,
  anchor: null,
  backdropClass: 'minitaur-backdrop',
  backdropClosingStyle: null,
  backdropOpeningStyle: null,
  backdropStyle: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  beforeClose: null,
  beforeInit: null,
  beforeOpen: null,
  breakpoints: null,
  class: 'minitaur',
  closeClass: 'closed',
  closeDuration: 0,
  closingClass: 'closing',
  closingStyle: null,
  closeOnFocusOut: true,
  closeStyle: {
    display: 'none',
    visibility: 'hidden'
  },
  content: null,
  id: null,
  mount: '.minitaur, [data-minitaur]',
  opened: false,
  openClass: 'opened',
  openDuration: 0,
  openingClass: 'opening',
  openingStyle: {
    display: 'block',
    visibility: 'visible'
  },
  openStyle: null,
  parameters: null,
  position: 'middle',
  respectAnchorSpacing: false,
  stayInBounds: true,
  style: null,
  takeover: false,
  triggers: []
}

minitaur.clearTimers = function (modal) {
  if (minitaur.resizeTimer) {
    clearTimeout(minitaur.resizeTimer)
    minitaur.resizeTimer = null
  }

  if (modal) {
    if (modal.minitaur.closeDurationTimer) {
      clearTimeout(modal.minitaur.closeDurationTimer)
      modal.minitaur.closeDurationTimer = null
    }

    if (modal.minitaur.openDurationTimer) {
      clearTimeout(modal.minitaur.openDurationTimer)
      modal.minitaur.openDurationTimer = null
    }
  }
}

minitaur.close = function (modals, options) {
  modals = minitaur.getModals(modals, true)

  for (var i = 0; i < modals.length; i++) {
    (function (modal) {
      if (options) modal.minitaur.set(options)

      var opts = minitaur.get(modal, true, false)

      if (minitaurDebug) console.log('minitaur.close (#' + modal.id + '):', opts)

      minitaur.clearTimers(modal)

      if (opts.beforeClose && opts.beforeClose(modal) === false) {
        return false
      }

      modal.classList.remove(opts.openClass)
      modal.classList.remove(opts.openingClass)
      modal.classList.add(opts.closingClass)
      minitaur.setStyle(modal, minitaur.mergeObjects(opts.style || {}, opts.closingStyle || {}))

      if (opts.takeover) {
        modal.removeAttribute('data-minitaur-taking-over')

        var backdrop = document.querySelector('[data-minitaur-backdrop="#' + modal.id + '"]')
        if (backdrop) {
          backdrop.classList.remove(opts.openClass)
          backdrop.classList.remove(opts.openingClass)
          backdrop.classList.add(opts.closingClass)

          var scrollX = parseInt(document.body.style.left || '0') * -1
          var scrollY = parseInt(document.body.style.top || '0') * -1

          minitaur.setStyle(backdrop, opts.backdropClosingStyle || {})

          minitaur.setStyle(document.body, {
            position: 'relative',
            left: null,
            top: null,
            height: null,
            width: null
          })

          window.scrollTo(scrollX, scrollY)
        }
      }

      modal.minitaur.closeDurationTimer = setTimeout(function () {
        modal.minitaur.isOpen = false

        modal.classList.remove(opts.closingClass)
        modal.classList.add(opts.closeClass)

        if (opts.takeover && backdrop) {
          document.body.removeChild(backdrop)
          window.addEventListener('scroll', minitaur.documentScroll)
        }

        minitaur.setStyle(modal, minitaur.mergeObjects(opts.style || {}, opts.closeStyle || {}))

        modal.dispatchEvent(new Event('close', { bubbles: true }))

        if (opts.afterClose) {
          opts.afterClose(modal)
        }
      }, opts.closeDuration || 0)
    })(modals[i])
  }
}

minitaur.documentClick = function (e) {
  var element = e.target
  var closeModals = true

  do {
    if (element === document.body) break
    if (
      element.minitaur ||
      element.minitaurIgnore ||
      element.classList.contains('minitaur-ignore')
    ) closeModals = false
  } while ((element = element.parentNode))

  if (closeModals) {
    var modals = minitaur.getModals('[data-minitaur]', true)

    for (var i = 0; i < modals.length; i++) {
      var modal = modals[i]

      if (modal.minitaur.closeOnFocusOut && modal.minitaur.isOpen === true) {
        modal.minitaur.close()
      }
    }
  }
}

minitaur.documentResize = function (e) {
  minitaur.clearTimers()

  minitaur.resizeTimer = setTimeout(function () {
    var elements = minitaur.getModals('[data-minitaur]', true)

    for (var i = 0; i < elements.length; i++) {
      (function (modal) {
        if (modal.minitaur.isOpen) {
          modal.minitaur.open()
        }
      })(elements[i])
    }
  }, 60)
}

minitaur.documentScroll = function (e) {
  minitaur.clearTimers()

  minitaur.resizeTimer = setTimeout(function () {
    var elements = minitaur.getModals('[data-minitaur]', true)

    for (var i = 0; i < elements.length; i++) {
      (function (modal) {
        var opts = modal.minitaur

        if (opts.isOpen && !opts.takeover && (opts.anchor.x === 'viewport' || opts.anchor.y === 'viewport')) {
          modal.minitaur.open()
        }
      })(elements[i])
    }
  }, 60)
}

minitaur.get = function (elements, parseBreakpoints, verify) {
  elements = minitaur.getModals(elements, verify)

  var modals = []

  for (var i = 0; i < elements.length; i++) {
    (function (modal) {
      var opts = minitaur.mergeObjects(modal.minitaur, { element: modal })

      if (parseBreakpoints && opts.breakpoints) {
        var breakpointOpts = null

        for (var breakpoint in opts.breakpoints) {
          if (document.documentElement.clientWidth >= parseInt(breakpoint)) {
            breakpointOpts = opts.breakpoints[breakpoint]
          }
        }

        if (breakpointOpts) {
          opts = minitaur.mergeObjects(opts, breakpointOpts)
        }

        delete opts.breakpoints
      }

      modals.push(opts)
    })(elements[i])
  }

  if (modals.length) {
    if (modals.length === 1) {
      return modals[0]
    }

    return modals
  }

  return false
}

minitaur.getModals = function (elements, verify) {
  if (typeof elements === 'string') {
    elements = document.querySelectorAll(elements)
  } else if (elements instanceof HTMLElement) {
    elements = [elements]
  }

  if (verify) {
    var verifiedElements = []

    for (var i = 0; i < elements.length; i++) {
      (function (modal) {
        if (!modal.minitaur) {
          console.warn('Element doesn\'t appear to be a minitaur instance:', modal)
          return
        }

        verifiedElements.push(modal)
      })(elements[i])
    }

    return verifiedElements
  }

  return elements
}

minitaur.initiateTriggers = function (modals) {
  modals = minitaur.getModals(modals, true)

  var actions = ['close', 'open', 'toggle']

  for (var i = 0; i < modals.length; i++) {
    var modal = modals[i]
    var opts = minitaur.get(modal, true, false)
    var triggers = opts.triggers

    if (typeof triggers === 'string') {
      triggers = [{
        action: 'toggle',
        elements: triggers,
        events: ['click']
      }]
    } else if (!triggers) {
      triggers = []
    }

    triggers = triggers.reduce(function (validTriggers, trigger) {
      if (Array.isArray(trigger)) {
        trigger.elements = trigger
      } else if (!trigger.elements) {
        console.warn('(minitaur: #' + modal.id + ') A trigger is missing it\'s elements option.', trigger)
        return validTriggers
      }

      validTriggers.push(trigger)
      return validTriggers
    }, [])

    for (var t = 0; t < triggers.length; t++) {
      var trigger = triggers[t]

      if (typeof trigger === 'string') {
        trigger = {
          action: 'toggle',
          elements: trigger,
          events: ['click']
        }
      }

      if (typeof trigger.elements === 'string') {
        trigger.elements = document.querySelectorAll(trigger.elements)
      } else if (trigger.elements instanceof HTMLElement) {
        trigger.elements = [trigger.elements]
      }

      if (!trigger.events) {
        trigger.events = ['click']
      } else if (typeof trigger.events === 'string') {
        trigger.events = [trigger.events]
      }

      if (!trigger.action || !actions.includes(trigger.action)) {
        trigger.action = 'toggle'
      }

      for (var e = 0; e < trigger.elements.length; e++) {
        var triggerElement = trigger.elements[e]
        var triggerElementTargets = triggerElement.getAttribute('data-minitaur-' + trigger.action)
        var triggerElementEvents = triggerElement.getAttribute('data-minitaur-event')

        if (triggerElementTargets) {
          triggerElementTargets = triggerElementTargets.split(',')

          if (!triggerElementTargets.includes('#' + modal.id)) {
            triggerElementTargets.push('#' + modal.id)
            triggerElement.setAttribute('data-minitaur-' + trigger.action, triggerElementTargets.join(','))
          }
        } else {
          triggerElement.setAttribute('data-minitaur-' + trigger.action, '#' + modal.id)
        }

        if (triggerElementEvents) {
          triggerElementEvents = triggerElementEvents.split(',')

          for (var te = 0; te < trigger.events.length; te++) {
            var triggerEvent = trigger.events[te]

            if (!triggerElementEvents.includes(triggerEvent)) {
              triggerElementEvents.push(triggerEvent)
            }
          }

          triggerElement.setAttribute('data-minitaur-event', triggerElementEvents.join(','))
        } else {
          triggerElement.setAttribute('data-minitaur-event', trigger.events.join(','))
        }
      }
    }

    for (var a = 0; a < actions.length; a++) {
      var action = actions[a]
      var triggerElements = document.querySelectorAll('[data-minitaur-' + action + '="#' + modal.id + '"], #' + modal.id + ' [data-minitaur-' + action + '=""]')

      for (var ae = 0; ae < triggerElements.length; ae++) {
        (function (triggerElement) {
          var triggerEvents = triggerElement.getAttribute('data-minitaur-event')
          var triggerTargets = triggerElement.getAttribute('data-minitaur-' + action)

          if (triggerTargets === '') {
            triggerElement.setAttribute('data-minitaur-' + action, '#' + modal.id)
          }

          if (triggerEvents) {
            triggerEvents = triggerEvents.split(',')
          } else {
            triggerEvents = ['click']
            triggerElement.setAttribute('data-minitaur-event', 'click')
          }

          for (var aee = 0; aee < triggerEvents.length; aee++) {
            var triggerEvent = triggerEvents[aee]
            triggerElement.addEventListener(triggerEvent, minitaur.triggerEvent)
          }

          triggerElement.minitaurIgnore = true
          triggerElement.setAttribute('data-minitaur-trigger', '')
        })(triggerElements[ae])
      }
    }
  }
}

minitaur.kill = function (modals, putBack) {
  modals = minitaur.getModals(modals, true)

  var actions = ['close', 'open', 'toggle']
  var triggerElements = document.querySelectorAll('[data-minitaur-trigger]')

  for (var i = 0; i < modals.length; i++) {
    (function (modal) {
      var opts = minitaur.get(modal, true, false)

      if (opts.isOpen) opts.close()

      document.body.removeChild(modal)

      if (putBack !== false) {
        if (opts.originalElement && opts.originalElementParent && opts.originalElementIndex) {
          opts.originalElementParent.insertBefore(
            opts.originalElement,
            opts.originalElementParent.childNodes[opts.originalElementIndex - 1]
          )
        }
      }

      for (var t = 0; t < triggerElements.length; t++) {
        var triggerElement = triggerElements[t]
        var nullActions = 0

        for (var a = 0; a < actions.length; a++) {
          var action = actions[a]
          var triggerElementTargets = triggerElement.getAttribute('data-minitaur-' + action)

          if (triggerElementTargets) {
            triggerElementTargets = triggerElementTargets.split(',')

            var triggerElementTargetIndex = triggerElementTargets.indexOf('#' + modal.id)

            if (triggerElementTargetIndex !== -1) {
              triggerElementTargets.splice(triggerElementTargetIndex, 1)

              if (triggerElementTargets.length) {
                triggerElement.setAttribute('data-minitaur-' + action, triggerElementTargets.join(','))
              } else {
                triggerElement.removeAttribute('data-minitaur-' + action)
                nullActions++
              }
            }
          } else {
            nullActions++
          }
        }

        if (nullActions === actions.length) {
          var triggerEvents = triggerElement.getAttribute('data-minitaur-event')

          triggerElement.removeAttribute('data-minitaur-event')
          triggerElement.removeAttribute('data-minitaur-trigger')

          for (var e = 0; e < triggerEvents.length; e++) {
            triggerElement.removeEventListener(triggerEvents[e], minitaur.triggerEvent)
          }

          delete triggerElement.minitaurIgnore
        }
      }

      minitaur.modalCount--
    })(modals[i])
  }

  if (!minitaur.modalCount) {
    document.removeEventListener('click', minitaur.documentClick)
    window.removeEventListener('resize', minitaur.documentResize)
    window.removeEventListener('scroll', minitaur.documentScroll)

    minitaur.initiated = false
  }
}

minitaur.mergeObjects = function (...objects) {
  var isObject = function (obj) { return obj && typeof obj === 'object' && !(obj instanceof HTMLElement) }

  return objects.reduce(function (prev, obj) {
    Object.keys(obj).forEach(function (key) {
      var pVal = prev[key]
      var oVal = obj[key]

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = [...pVal, ...oVal].filter(function (element, index, array) {
          return array.indexOf(element) === index
        })
      } else if (isObject(pVal) && isObject(oVal)) {
        prev[key] = minitaur.mergeObjects(pVal, oVal)
      } else {
        prev[key] = oVal
      }
    })

    return prev
  }, {})
}

minitaur.open = function (modals, options) {
  modals = minitaur.getModals(modals, true)

  for (var i = 0; i < modals.length; i++) {
    (function (modal) {
      if (options) modal.minitaur.set(options)

      var opts = minitaur.get(modal, true, false)

      if (minitaurDebug) console.log('minitaur.open (#' + modal.id + '):', opts)

      minitaur.clearTimers(modal)

      if (opts.beforeOpen && opts.beforeOpen(modal) === false) {
        return false
      }

      if (opts.content) {
        if (typeof opts.content === 'function') {
          opts.content = opts.content(modal)
        }

        if (modal.innerHTML !== opts.content) {
          modal.innerHTML = opts.content
        }
      }

      if (opts.parameters) {
        for (var parameter in opts.parameters) {
          modal.innerHTML = modal.innerHTML.replace(
            new RegExp('{' + parameter + '}', 'g'),
            opts.parameters[parameter]
          )
        }
      }

      modal.classList.remove(opts.closeClass)
      modal.classList.remove(opts.closingClass)
      modal.classList.add(opts.openingClass)
      minitaur.setStyle(modal, minitaur.mergeObjects(opts.style || {}, opts.openingStyle || {}))

      if (opts.takeover && !document.querySelector('#' + modal.id + '-backdrop')) {
        window.removeEventListener('scroll', minitaur.documentScroll)

        minitaur.close('[data-minitaur][data-minitaur-taking-over]')

        var backdrop = document.createElement('div')

        backdrop.id = modal.id + '-backdrop'

        modal.setAttribute('data-minitaur-taking-over', '')
        backdrop.setAttribute('data-minitaur-backdrop', '#' + modal.id)
        backdrop.classList.add(opts.backdropClass)
        backdrop.classList.add(opts.openingClass)

        minitaur.setStyle(backdrop, minitaur.mergeObjects({
          position: 'absolute',
          left: '0px',
          top: '0px',
          right: '0px',
          bottom: '0px',
          zIndex: 99998
        }, opts.backdropOpeningStyle || {}))

        minitaur.setStyle(document.body, {
          position: 'fixed',
          left: '-' + window.scrollX + 'px',
          top: '-' + window.scrollY + 'px',
          height: document.body.clientHeight + 'px',
          width: document.body.clientWidth + 'px'
        })

        document.body.insertBefore(backdrop, modal)
      } else {
        minitaur.setStyle(document.body, { position: 'relative' })
      }

      modal.minitaur.openDurationTimer = setTimeout(function () {
        modal.minitaur.isOpen = true

        modal.classList.remove(opts.openingClass)
        modal.classList.add(opts.openClass)

        if (opts.takeover && backdrop) {
          backdrop.classList.remove(opts.openingClass)
          backdrop.classList.add(opts.openClass)
          minitaur.setStyle(backdrop, opts.backdropStyle || {})
        }

        minitaur.setDimensions(modal, opts)
        minitaur.initiateTriggers(modal)

        modal.dispatchEvent(new Event('open', { bubbles: true }))

        if (opts.afterOpen) {
          opts.afterOpen(modal)
        }
      }, opts.openDuration || 0)
    })(modals[i])
  }
}

minitaur.parseAttributes = function (data) {
  var opts = {}
  var keyPrefix = 'minitaur'
  var arrayParameters = ['class']
  var objectParameters = ['anchor', 'backdropStyle', 'breakpoints', 'closeStyle', 'openStyle', 'parameters', 'position', 'respectAnchorSpacing', 'style']
  var deepObjectParameters = ['breakpoints']
  var validParameters = Object.keys(minitaur.defaultOptions).concat(['triggerElement'])

  for (var key in data) {
    if (key !== keyPrefix && key.substring(0, keyPrefix.length).toLowerCase() === keyPrefix.toLowerCase()) {
      var property = key.charAt(keyPrefix.length).toLowerCase() + key.substring(keyPrefix.length + 1).replace('-', '')
      var propSet = false
      var value = data[key]

      if (value.toLowerCase() === 'true' || !value.length) {
        value = true
      } else if (value.toLowerCase() === 'false') {
        value = false
      }

      if (arrayParameters.includes(property)) {
        value = value.split(',')
      }

      for (var o = 0; o < objectParameters.length; o++) {
        var objKey = objectParameters[o]
        var objProp = property.substring(0, objKey.length)

        if (objProp.length !== property.length && objProp.toLowerCase() === objKey.toLowerCase()) {
          var objPropKey = property.substring(objKey.length).toLowerCase()

          if (!opts[objKey]) {
            opts[objKey] = {}
          }

          if (deepObjectParameters.includes(objProp)) {
            var breakpoint = objPropKey.match(/^\d+/)

            if (breakpoint) {
              opts[objKey][breakpoint[0]] = minitaur.parseAttributes({ [keyPrefix + objPropKey.substring(breakpoint[0].length)]: value })
            } else {
              opts[objKey] = minitaur.parseAttributes({ [keyPrefix + objPropKey]: value })
            }
          } else {
            opts[objKey][objPropKey] = value
          }

          propSet = true
          break
        }
      }

      if (!propSet && validParameters.includes(property)) {
        opts[property] = value
      }
    }
  }

  return opts
}

minitaur.parseOptions = function (opts) {
  if (opts.takeover) opts.anchor = 'viewport'

  if (!opts.anchor || typeof opts.anchor === 'string') {
    opts.anchor = {
      x: opts.anchor,
      y: opts.anchor
    }
  }

  if (!opts.position || typeof opts.position === 'string') {
    opts.position = opts.position ? opts.position.split(' ') : ['middle']
    opts.position = {
      x: opts.position[1] || 'middle',
      y: opts.position[0]
    }
  }

  if (!opts.position.x) opts.position.x = 'middle'
  if (!opts.position.y) opts.position.y = 'middle'

  if (!opts.respectAnchorSpacing || typeof opts.respectAnchorSpacing === 'boolean') {
    opts.respectAnchorSpacing = {
      x: opts.respectAnchorSpacing,
      y: opts.respectAnchorSpacing
    }
  }

  if (!opts.respectAnchorSpacing.x) opts.respectAnchorSpacing.x = false
  if (!opts.respectAnchorSpacing.y) opts.respectAnchorSpacing.y = false

  return opts
}

minitaur.set = function (modals, options, value) {
  modals = minitaur.getModals(modals, true)

  if (typeof options === 'string') {
    options = { [options]: value }
  }

  for (var i = 0; i < modals.length; i++) {
    (function (modal) {
      if (minitaurDebug) console.log('minitaur.set (#' + modal.id + '):', options)
      modal.minitaur = minitaur.parseOptions(minitaur.mergeObjects(modal.minitaur, options || {}))
    })(modals[i])
  }
}

minitaur.setDimensions = function (modal, options, final) {
  var opts = minitaur.get(modal, true, false)

  opts = minitaur.mergeObjects(opts, options || {})

  if (!opts.anchor.x) opts.anchor.x = opts.triggerElement || document.body
  if (!opts.anchor.y) opts.anchor.y = opts.triggerElement || document.body

  var anchorXElement = null
  var anchorYElement = null

  if (typeof opts.anchor.x === 'string') {
    if (opts.anchor.x === 'viewport') {
      anchorXElement = document.body
    } else {
      anchorXElement = document.querySelector(opts.anchor.x)
    }
  } else {
    anchorXElement = opts.anchor.x
  }

  if (typeof opts.anchor.y === 'string') {
    if (opts.anchor.y === 'viewport') {
      anchorYElement = document.body
    } else {
      anchorYElement = document.querySelector(opts.anchor.y)
    }
  } else {
    anchorYElement = opts.anchor.y
  }

  if (!(anchorXElement instanceof HTMLElement)) {
    console.warn('(minitaur: #' + modal.id + ') Unable to find anchor.x:', anchorXElement)
    anchorXElement = document.body
  }

  if (!(anchorYElement instanceof HTMLElement)) {
    console.warn('(minitaur: #' + modal.id + ') Unable to find anchor.y:', anchorYElement)
    anchorYElement = document.body
  }

  var modalClone = modal.cloneNode(true)

  minitaur.setStyle(modalClone, minitaur.mergeObjects(opts.style || {}, opts.openStyle || {}, {
    left: '0px',
    opacity: '0',
    position: 'absolute',
    top: '0px',
    transition: 'none'
  }))

  document.body.appendChild(modalClone)

  var modalStyle = getComputedStyle(modalClone)
  var anchorXRect = anchorXElement.getBoundingClientRect()
  var anchorXLeft = anchorXRect.x + window.scrollX
  var anchorXTop = anchorXRect.y + window.scrollY
  var anchorXWidth = anchorXRect.width
  var anchorXHeight = anchorXRect.height
  var anchorYRect = anchorYElement.getBoundingClientRect()
  var anchorYLeft = anchorYRect.x + window.scrollX
  var anchorYTop = anchorYRect.y + window.scrollY
  var anchorYWidth = anchorYRect.width
  var anchorYHeight = anchorYRect.height
  var modalMarginLeft = parseFloat(modalStyle.getPropertyValue('margin-left'))
  var modalMarginTop = parseFloat(modalStyle.getPropertyValue('margin-top'))
  var modalMarginRight = parseFloat(modalStyle.getPropertyValue('margin-right'))
  var modalMarginBottom = parseFloat(modalStyle.getPropertyValue('margin-bottom'))
  var modalWidth = modalClone.offsetWidth + modalMarginLeft + modalMarginRight
  var modalHeight = modalClone.offsetHeight + modalMarginTop + modalMarginBottom
  var left = 0
  var top = 0
  var width = parseFloat(modalStyle.getPropertyValue('width'))
  var height = parseFloat(modalStyle.getPropertyValue('height'))
  var boundaryX = document.body.clientWidth
  var boundaryY = document.body.clientHeight
  var adjustTopPositionFirst = false

  document.body.removeChild(modalClone)

  if (opts.anchor.x === 'viewport') {
    anchorXLeft = window.scrollX
    anchorXTop = window.scrollY
    anchorXWidth = window.innerWidth
    anchorXHeight = window.innerHeight
    boundaryX = anchorXWidth + window.scrollX
  }

  if (opts.anchor.y === 'viewport') {
    anchorYLeft = window.scrollX
    anchorYTop = window.scrollY
    anchorYWidth = window.innerWidth
    anchorYHeight = window.innerHeight
    boundaryY = anchorYHeight + window.scrollY
  }

  if (opts.takeover) {
    anchorXLeft = 0 - parseInt(document.body.style.left || '0')
    anchorXTop = 0 - parseInt(document.body.style.top || '0')
    anchorYLeft = 0 - parseInt(document.body.style.left || '0')
    anchorYTop = 0 - parseInt(document.body.style.top || '0')
    boundaryX = anchorXLeft + window.innerWidth
    boundaryY = anchorYTop + window.innerHeight
  }

  if (anchorXElement === document.body) {
    switch (opts.position.x) {
      case 'left':
        opts.position.x = 'inner-left'
        break
      case 'right':
        opts.position.x = 'inner-right'
        break
    }
  }

  if (anchorYElement === document.body) {
    switch (opts.position.y) {
      case 'top':
        opts.position.y = 'inner-top'
        break
      case 'bottom':
        opts.position.y = 'inner-bottom'
        break
    }
  }

  if (opts.respectAnchorSpacing.x) {
    var anchorXStyle = getComputedStyle(anchorXElement)

    switch (opts.position.x) {
      case 'inner-left':
        anchorXLeft += parseFloat(anchorXStyle.getPropertyValue('padding-left'))
        break
      case 'left':
        anchorXLeft -= parseFloat(anchorXStyle.getPropertyValue('margin-left'))
        break
      case 'inner-right':
        anchorXWidth -= parseFloat(anchorXStyle.getPropertyValue('padding-right'))
        break
      case 'right':
        anchorXWidth += parseFloat(anchorXStyle.getPropertyValue('margin-right'))
        break
    }
  }

  if (opts.respectAnchorSpacing.y) {
    var anchorYStyle = getComputedStyle(anchorYElement)

    switch (opts.position.y) {
      case 'inner-top':
        anchorYTop += parseFloat(anchorYStyle.getPropertyValue('padding-top'))
        break
      case 'top':
        anchorYTop -= parseFloat(anchorYStyle.getPropertyValue('margin-top'))
        break
      case 'inner-bottom':
        anchorYHeight -= parseFloat(anchorYStyle.getPropertyValue('padding-bottom'))
        break
      case 'bottom':
        anchorXHeight += parseFloat(anchorYStyle.getPropertyValue('margin-bottom'))
        break
    }
  }

  if (minitaurDebug) {
    console.log('minitaur.setDimensions (#' + modal.id + '):', {
      anxhorX: {
        element: anchorXElement,
        left: anchorXLeft,
        top: anchorXTop,
        width: anchorXWidth,
        height: anchorXHeight,
        rect: anchorXRect,
        boundary: boundaryX
      },
      anxhorY: {
        element: anchorYElement,
        left: anchorYLeft,
        top: anchorYTop,
        width: anchorYWidth,
        height: anchorYHeight,
        rect: anchorYRect,
        boundary: boundaryY
      },
      modal: {
        height: modalHeight,
        width: modalWidth
      },
      scroll: {
        x: window.scrollX,
        y: window.scrollY
      }
    })
  }

  switch (opts.position.x) {
    case 'inner-left':
      left = anchorXLeft
      break
    case 'left':
      left = anchorXLeft - modalWidth - 1
      break
    case 'middle':
      left = anchorXLeft + (anchorXWidth / 2) - (modalWidth / 2)
      break
    case 'inner-right':
      left = anchorXLeft + anchorXWidth - modalWidth
      break
    case 'right':
      left = anchorXLeft + anchorXWidth + 1
      break
    default:
      if (typeof opts.position.x === 'string') {
        if (opts.position.x[opts.position.x.length - 1] === '%') {
          left = anchorXLeft + ((opts.position.x.substr(0, opts.position.x.length - 1) / 100) * anchorXWidth)
        } else {
          left = anchorXLeft + parseInt(opts.position.x)
        }
      } else if (Number.isFinite(opts.position.x)) {
        left = anchorXLeft + opts.position.x
      } else {
        console.warn('minitaur (#' + modal.id + ') Invalid position.x value:', opts.position.x)
        return false
      }
  }

  switch (opts.position.y) {
    case 'inner-top':
      top = anchorYTop
      break
    case 'top':
      top = anchorYTop - modalHeight - 1
      break
    case 'middle':
      top = anchorYTop + (anchorYHeight / 2) - (modalHeight / 2)
      break
    case 'inner-bottom':
      top = anchorYTop + anchorYHeight - modalHeight
      break
    case 'bottom':
      top = anchorYTop + anchorYHeight + 1
      break
    default:
      if (typeof opts.position.y === 'string') {
        if (opts.position.y[opts.position.y.length - 1] === '%') {
          top = anchorYTop + ((opts.position.y.substr(0, opts.position.y.length - 1) / 100) * anchorYHeight)
        } else {
          top = anchorYTop + parseInt(opts.position.y)
        }
      } else if (Number.isFinite(opts.position.y)) {
        top = anchorYTop + opts.position.y
      } else {
        console.warn('minitaur (#' + modal.id + ') Invalid position.y value:', opts.position.y)
        return false
      }
  }

  if (opts.stayInBounds) {
    if ((left + modalWidth) >= boundaryX) {
      left = boundaryX - modalWidth
    }

    if (left < 0) {
      left = 0
    }

    if ((top + modalHeight) >= boundaryY) {
      top = boundaryY - modalHeight
      adjustTopPositionFirst = true
    }

    if (top < 0) {
      top = 0
      adjustTopPositionFirst = true
    }

    if (
      opts.position.x === 'left' ||
      opts.position.x === 'right' ||
      opts.position.y === 'top' ||
      opts.position.y === 'bottom'
    ) {
      var anchorXOverlap = false
      var anchorYOverlap = false

      if (anchorXElement !== document.body) {
        var anchorXLeftOverlap = (
          (left >= anchorXLeft && left < (anchorXLeft + anchorXWidth)) ||
          (left < anchorXLeft && (left + modalWidth) >= anchorXLeft)
        )

        var anchorXTopOverlap = (
          (top >= anchorXTop && top < (anchorXTop + anchorXHeight)) ||
          (top < anchorXTop && (top + modalHeight) >= anchorXTop)
        )

        anchorXOverlap = anchorXLeftOverlap && anchorXTopOverlap
      }

      if (anchorYElement !== document.body) {
        var anchorYLeftOverlap = (
          (left >= anchorYLeft && left < (anchorYLeft + anchorYWidth)) ||
          (left < anchorYLeft && (left + modalWidth) >= anchorYLeft)
        )

        var anchorYTopOverlap = (
          (top >= anchorYTop && top < (anchorYTop + anchorYHeight)) ||
          (top < anchorYTop && (top + modalHeight) >= anchorYTop)
        )

        anchorYOverlap = anchorYLeftOverlap && anchorYTopOverlap
      }

      if (anchorXOverlap || anchorYOverlap) {
        if (!adjustTopPositionFirst) {
          if (opts.position.x === 'left') {
            if (!final) {
              opts.position.x = 'right'
              return minitaur.setDimensions(modal, opts, true)
            }
          } else {
            opts.position.x = 'left'
            return minitaur.setDimensions(modal, opts, true)
          }
        } else {
          if (opts.position.y === 'top') {
            if (!final) {
              opts.position.y = 'bottom'
              return minitaur.setDimensions(modal, opts, true)
            }
          } else {
            opts.position.y = 'top'
            return minitaur.setDimensions(modal, opts, true)
          }
        }
      }
    }
  }

  minitaur.setStyle(modal, minitaur.mergeObjects({ zIndex: opts.takeover ? 99999 : null }, opts.style || {}, opts.openStyle || {}, {
    position: 'absolute',
    left: left + 'px',
    top: top + 'px',
    width: width + 'px',
    height: height + 'px'
  }))

  return true
}

minitaur.setStyle = function (element, styles) {
  if (minitaurDebug) console.log('minitaur.setStyle (' + (element.id ? '#' + element.id : element.tagName) + '):', styles)

  for (var property in styles) {
    element.style[property] = styles[property]
  }
}

minitaur.toggle = function (modals, options) {
  modals = minitaur.getModals(modals, true)

  for (var i = 0; i < modals.length; i++) {
    (function (modal) {
      if (minitaurDebug) console.log('minitaur.toggle (#' + modal.id + '):', options)

      if (modal.minitaur.isOpen) {
        modal.minitaur.close(options)
      } else {
        modal.minitaur.open(options)
      }
    })(modals[i])
  }
}

minitaur.triggerEvent = function (e) {
  var actions = ['close', 'open', 'toggle']
  var triggerElement = e.currentTarget
  var opts = minitaur.mergeObjects(minitaur.parseAttributes(triggerElement.dataset), { triggerElement: triggerElement })

  for (var i = 0; i < actions.length; i++) {
    var action = actions[i]
    var targetElements = triggerElement.getAttribute('data-minitaur-' + action)

    if (targetElements) {
      if (minitaurDebug) console.log('minitaur.triggerEvent:', targetElements, opts)
      minitaur[action](targetElements, opts)
    }
  }
}
