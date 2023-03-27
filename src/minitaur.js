/*!
  minitaur v0.2.1 (https://minitaur.js.org)
  by Kodie Grantham (https://kodieg.com)
*/

const minitaur = (mount, options) => {
  let elements = []
  let modals = []

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
    if (options.id) {
      elements = [document.getElementById(options.id) || document.createElement('div')]
    } else {
      elements = [document.createElement('div')]
    }
  }

  elements = minitaur.getModals(elements)

  if (elements && elements.length) {
    for (let i = 0; i < elements.length; i++) {
      (function (modal) {
        if (modal.minitaur) {
          return true
        }

        if (options.beforeInit && options.beforeInit(modal) === false) {
          return false
        }

        minitaur.modalCount++

        let funcs = {
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

        let opts = minitaur.parseOptions(minitaur.mergeObjects(options, minitaur.parseAttributes(modal.dataset), funcs, {
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

        if (window.minitaurDebug) console.log('minitaur.init (#' + modal.id + '):', opts)

        if (opts.class) {
          if (typeof opts.class === 'string') {
            opts.class = [opts.class]
          }

          for (let c = 0; c < opts.class.length; c++) {
            modal.classList.add(opts.class[c])
          }
        }

        minitaur.setStyle(modal, minitaur.mergeObjects(opts.style || {}, opts.closeStyle || {}))
        minitaur.initializeTriggers(modal)

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

  if (!minitaur.initialized) {
    minitaur.initialized = true

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

minitaur.initialized = false
minitaur.modalCount = 0
minitaur.templates = {}

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
  overrides: null,
  parameters: null,
  position: 'middle',
  respectAnchorSpacing: false,
  stayInBounds: true,
  style: null,
  takeover: false,
  template: null,
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

minitaur.close = (modals, options) => {
  modals = minitaur.getModals(modals, true)

  for (let i = 0; i < modals.length; i++) {
    (function (modal) {
      const opts = minitaur.parseOptions(minitaur.mergeObjects(minitaur.get(modal, true, false), modal.minitaurTempOpts || {}, options || {}))

      delete modal.minitaurTempOpts

      if (window.minitaurDebug) console.log('minitaur.close (#' + modal.id + '):', opts)

      minitaur.clearTimers(modal)

      if (opts.beforeClose && opts.beforeClose(modal, opts) === false) {
        return false
      }

      modal.classList.remove(opts.openClass)
      modal.classList.remove(opts.openingClass)
      modal.classList.add(opts.closingClass)
      minitaur.setStyle(modal, minitaur.mergeObjects(opts.style || {}, opts.closingStyle || {}))

      let backdrop = null

      if (opts.takeover) {
        modal.removeAttribute('data-minitaur-taking-over')

        backdrop = document.querySelector('[data-minitaur-backdrop="#' + modal.id + '"]')

        if (backdrop) {
          backdrop.classList.remove(opts.openClass)
          backdrop.classList.remove(opts.openingClass)
          backdrop.classList.add(opts.closingClass)

          const scrollX = parseInt(document.body.style.left || '0') * -1
          const scrollY = parseInt(document.body.style.top || '0') * -1

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
          opts.afterClose(modal, opts)
        }
      }, opts.closeDuration || 0)
    })(modals[i])
  }
}

minitaur.documentClick = (e) => {
  let element = e.target
  let closeModals = true

  do {
    if (element === document.body) break
    if (
      element.minitaur ||
      element.minitaurIgnore ||
      element.classList.contains('minitaur-ignore')
    ) closeModals = false
  } while ((element = element.parentNode))

  if (closeModals) {
    const modals = minitaur.getModals('[data-minitaur]', true)

    for (let i = 0; i < modals.length; i++) {
      let modal = modals[i]

      if (modal.minitaur.closeOnFocusOut && modal.minitaur.isOpen === true) {
        modal.minitaur.close()
      }
    }
  }
}

minitaur.documentResize = (e) => {
  minitaur.clearTimers()

  minitaur.resizeTimer = setTimeout(function () {
    const elements = minitaur.getModals('[data-minitaur]', true)

    for (let i = 0; i < elements.length; i++) {
      (function (modal) {
        if (modal.minitaur.isOpen) {
          modal.minitaur.open()
        }
      })(elements[i])
    }
  }, 60)
}

minitaur.documentScroll = (e) => {
  minitaur.clearTimers()

  minitaur.resizeTimer = setTimeout(function () {
    const elements = minitaur.getModals('[data-minitaur]', true)

    for (let i = 0; i < elements.length; i++) {
      (function (modal) {
        const opts = modal.minitaur

        if (opts.isOpen && !opts.takeover && (opts.anchor.x === 'viewport' || opts.anchor.y === 'viewport')) {
          modal.minitaur.open()
        }
      })(elements[i])
    }
  }, 60)
}

minitaur.get = (elements, parseBreakpoints, verify) => {
  elements = minitaur.getModals(elements, verify)

  let modals = []

  for (let i = 0; i < elements.length; i++) {
    (function (modal) {
      let opts = minitaur.mergeObjects(modal.minitaur, { element: modal })

      if (opts.overrides) {
        for (let selector in opts.overrides) {
          if (modal.matches(selector)) {
            opts = minitaur.mergeObjects(opts, opts.overrides[selector])
          }
        }

        delete opts.overrides
      }

      if (parseBreakpoints && opts.breakpoints) {
        let breakpointOpts = null

        for (let breakpoint in opts.breakpoints) {
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

minitaur.getModals = (elements, verify) => {
  if (typeof elements === 'string') {
    elements = document.querySelectorAll(elements)
  } else if (elements instanceof HTMLElement) {
    elements = [elements]
  }

  if (verify) {
    let verifiedElements = []

    for (let i = 0; i < elements.length; i++) {
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

minitaur.initializeTriggers = (modals) => {
  modals = minitaur.getModals(modals, true)

  let actions = ['close', 'open', 'toggle']

  for (let i = 0; i < modals.length; i++) {
    const modal = modals[i]
    let opts = minitaur.get(modal, true, false)
    let triggers = opts.triggers || opts.trigger

    if (typeof triggers === 'string') {
      triggers = [{
        action: 'toggle',
        elements: triggers,
        events: ['click']
      }]
    } else if (!triggers) {
      triggers = []
    }

    triggers = triggers.reduce((validTriggers, trigger) => {
      if (Array.isArray(trigger)) {
        trigger.elements = trigger
      } else if (!trigger.elements) {
        console.warn('(minitaur: #' + modal.id + ') A trigger is missing it\'s elements option.', trigger)
        return validTriggers
      }

      validTriggers.push(trigger)
      return validTriggers
    }, [])

    for (let t = 0; t < triggers.length; t++) {
      let trigger = triggers[t]

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

      for (let e = 0; e < trigger.elements.length; e++) {
        const triggerElement = trigger.elements[e]
        let triggerElementTargets = triggerElement.getAttribute('data-minitaur-' + trigger.action)
        let triggerElementEvents = triggerElement.getAttribute('data-minitaur-event')

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

          for (let te = 0; te < trigger.events.length; te++) {
            const triggerEvent = trigger.events[te]

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

    for (let a = 0; a < actions.length; a++) {
      const action = actions[a]
      const triggerElements = document.querySelectorAll('[data-minitaur-' + action + '="#' + modal.id + '"], #' + modal.id + ' [data-minitaur-' + action + '=""]')

      for (let ae = 0; ae < triggerElements.length; ae++) {
        (function (triggerElement) {
          let triggerEvents = triggerElement.getAttribute('data-minitaur-event')
          let triggerTargets = triggerElement.getAttribute('data-minitaur-' + action)

          if (triggerTargets === '') {
            triggerElement.setAttribute('data-minitaur-' + action, '#' + modal.id)
          }

          if (triggerEvents) {
            triggerEvents = triggerEvents.split(',')
          } else {
            triggerEvents = ['click']
            triggerElement.setAttribute('data-minitaur-event', 'click')
          }

          for (let aee = 0; aee < triggerEvents.length; aee++) {
            let triggerEvent = triggerEvents[aee]
            triggerElement.addEventListener(triggerEvent, minitaur.triggerEvent)
          }

          triggerElement.minitaurIgnore = true
          triggerElement.setAttribute('data-minitaur-trigger', '')
        })(triggerElements[ae])
      }
    }
  }
}

minitaur.kill = (modals, putBack) => {
  modals = minitaur.getModals(modals, true)

  const actions = ['close', 'open', 'toggle']
  const triggerElements = document.querySelectorAll('[data-minitaur-trigger]')

  for (let i = 0; i < modals.length; i++) {
    (function (modal) {
      const opts = minitaur.get(modal, true, false)

      if (opts.isOpen) opts.close()

      document.body.removeChild(modal)

      if (putBack !== false) {
        if (opts.originalElement && opts.originalElementParent && opts.originalElementIndex) {
          if (opts.originalElementIndex) {
            if (opts.originalElementIndex > opts.originalElementParent.childNodes.length - 1) {
              opts.originalElementParent.append(opts.originalElement)
            } else {
              opts.originalElementParent.insertBefore(
                opts.originalElement,
                opts.originalElementParent.childNodes[opts.originalElementIndex]
              )
            }
          } else {
            opts.originalElementParent.prepend(opts.originalElement)
          }
        }
      }

      for (let t = 0; t < triggerElements.length; t++) {
        const triggerElement = triggerElements[t]
        let nullActions = 0

        for (let a = 0; a < actions.length; a++) {
          const action = actions[a]
          let triggerElementTargets = triggerElement.getAttribute('data-minitaur-' + action)

          if (triggerElementTargets) {
            triggerElementTargets = triggerElementTargets.split(',')

            let triggerElementTargetIndex = triggerElementTargets.indexOf('#' + modal.id)

            if (triggerElementTargetIndex !== -1) {
              triggerElementTargets.splice(triggerElementTargetIndex, 1)

              if (!triggerElementTargets.length) {
                nullActions++
              }
            }
          } else {
            nullActions++
          }
        }

        if (nullActions === actions.length) {
          let triggerEvents = triggerElement.getAttribute('data-minitaur-event')
          triggerEvents = triggerEvents ? triggerEvents.split(',') : []

          triggerElement.removeAttribute('data-minitaur-event')
          triggerElement.removeAttribute('data-minitaur-trigger')

          for (let e = 0; e < triggerEvents.length; e++) {
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

    minitaur.initialized = false
  }
}

minitaur.mergeObjects = (...objects) => {
  const isObject = function (obj) { return obj && typeof obj === 'object' && !(obj instanceof HTMLElement) }

  return objects.reduce((prev, obj) => {
    Object.keys(obj).forEach((key) => {
      const pVal = prev[key]
      const oVal = obj[key]

      if (Array.isArray(pVal) && Array.isArray(oVal)) {
        prev[key] = [...pVal, ...oVal].filter((element, index, array) => {
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

minitaur.open = (modals, options) => {
  modals = minitaur.getModals(modals, true)

  for (let i = 0; i < modals.length; i++) {
    (function (modal) {
      const opts = minitaur.parseOptions(minitaur.mergeObjects(minitaur.get(modal, true, false), options || {}))

      modal.minitaurTempOpts = opts

      if (window.minitaurDebug) console.log('minitaur.open (#' + modal.id + '):', opts)

      minitaur.clearTimers(modal)

      if (opts.beforeOpen && opts.beforeOpen(modal, opts) === false) {
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

      if (opts.template) {
        const templateContentElement = modal.querySelector('.minitaur-content')
        let templateContent = modal.innerHTML
        let template = minitaur.templates[opts.template] || opts.template

        if (templateContentElement) {
          templateContent = templateContentElement.innerHTML
        }

        if (typeof template === 'function') {
          template = template(modal)
        }

        const templateClone = document.createElement('div')
        templateClone.innerHTML = template
        const templateHasContentElement = !!templateClone.querySelector('.minitaur-content')
        templateClone.remove()

        if (!templateHasContentElement) {
          templateContent = `<div class="minitaur-content">${templateContent}</div>`
        }

        modal.classList.remove.apply(modal.classList, Array.from(modal.classList).filter(c => c.startsWith('minitaur-template-')))

        if (minitaur.templates[opts.template]) {
          modal.classList.add('minitaur-template-' + opts.template)
        }

        modal.innerHTML = template.replace('{minitaur-content}', templateContent)
      }

      if (opts.parameters) {
        for (let parameter in opts.parameters) {
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

      let backdrop = null

      if (opts.takeover && !document.querySelector('#' + modal.id + '-backdrop')) {
        window.removeEventListener('scroll', minitaur.documentScroll)

        minitaur.close('[data-minitaur][data-minitaur-taking-over]')

        backdrop = document.createElement('div')

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
        minitaur.initializeTriggers(modal)

        modal.dispatchEvent(new Event('open', { bubbles: true }))

        if (opts.afterOpen) {
          opts.afterOpen(modal, opts)
        }
      }, opts.openDuration || 0)
    })(modals[i])
  }
}

minitaur.parseAttributes = (data) => {
  let opts = {}
  const keyPrefix = 'minitaur'
  const arrayParameters = ['class']
  const objectParameters = ['anchor', 'backdropStyle', 'breakpoints', 'closeStyle', 'openStyle', 'parameters', 'position', 'respectAnchorSpacing', 'style']
  const deepObjectParameters = ['breakpoints']
  const validParameters = Object.keys(minitaur.defaultOptions).concat(['triggerElement'])

  for (let key in data) {
    if (key !== keyPrefix && key.substring(0, keyPrefix.length).toLowerCase() === keyPrefix.toLowerCase()) {
      const property = key.charAt(keyPrefix.length).toLowerCase() + key.substring(keyPrefix.length + 1).replace('-', '')
      let propSet = false
      let value = data[key]

      if (value.toLowerCase() === 'true' || !value.length) {
        value = true
      } else if (value.toLowerCase() === 'false') {
        value = false
      }

      if (arrayParameters.includes(property)) {
        value = value.split(',')
      }

      for (let o = 0; o < objectParameters.length; o++) {
        const objKey = objectParameters[o]
        const objProp = property.substring(0, objKey.length)

        if (objProp.length !== property.length && objProp.toLowerCase() === objKey.toLowerCase()) {
          let objPropKey = property.substring(objKey.length)
          objPropKey = objPropKey[0].toLowerCase() + objPropKey.slice(1)

          if (!opts[objKey]) {
            opts[objKey] = {}
          }

          if (deepObjectParameters.includes(objProp)) {
            let breakpoint = objPropKey.match(/^\d+/)

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

minitaur.parseOptions = (opts) => {
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

minitaur.set = (modals, options, value) => {
  modals = minitaur.getModals(modals, true)

  if (typeof options === 'string') {
    options = { [options]: value }
  }

  for (let i = 0; i < modals.length; i++) {
    (function (modal) {
      if (window.minitaurDebug) console.log('minitaur.set (#' + modal.id + '):', options)
      modal.minitaur = minitaur.parseOptions(minitaur.mergeObjects(modal.minitaur, options || {}))
    })(modals[i])
  }
}

minitaur.setDimensions = (modal, options, final) => {
  let opts = minitaur.get(modal, true, false)

  opts = minitaur.mergeObjects(opts, options || {})

  if (!opts.anchor.x) opts.anchor.x = opts.triggeredElement || document.body
  if (!opts.anchor.y) opts.anchor.y = opts.triggeredElement || document.body

  let anchorXElement = null
  let anchorYElement = null

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

  const modalClone = modal.cloneNode(true)

  minitaur.setStyle(modalClone, minitaur.mergeObjects(opts.style || {}, opts.openStyle || {}, {
    left: '0px',
    opacity: '0',
    position: 'absolute',
    top: '0px',
    transition: 'none'
  }))

  document.body.appendChild(modalClone)

  const modalStyle = getComputedStyle(modalClone)
  const anchorXRect = anchorXElement.getBoundingClientRect()
  let anchorXLeft = anchorXRect.x + window.scrollX
  let anchorXTop = anchorXRect.y + window.scrollY
  let anchorXWidth = anchorXRect.width
  let anchorXHeight = anchorXRect.height
  let anchorYRect = anchorYElement.getBoundingClientRect()
  let anchorYLeft = anchorYRect.x + window.scrollX
  let anchorYTop = anchorYRect.y + window.scrollY
  let anchorYWidth = anchorYRect.width
  let anchorYHeight = anchorYRect.height
  const modalMarginLeft = parseFloat(modalStyle.getPropertyValue('margin-left'))
  const modalMarginTop = parseFloat(modalStyle.getPropertyValue('margin-top'))
  const modalMarginRight = parseFloat(modalStyle.getPropertyValue('margin-right'))
  const modalMarginBottom = parseFloat(modalStyle.getPropertyValue('margin-bottom'))
  const modalWidth = modalClone.offsetWidth + modalMarginLeft + modalMarginRight
  const modalHeight = modalClone.offsetHeight + modalMarginTop + modalMarginBottom
  let left = 0
  let top = 0
  let width = parseFloat(modalClone.style.width || modalStyle.getPropertyValue('width'))
  let height = parseFloat(modalClone.style.height || modalStyle.getPropertyValue('height'))
  let boundaryX = document.body.clientWidth
  let boundaryY = document.body.clientHeight
  let adjustTopPositionFirst = false

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
    const anchorXStyle = getComputedStyle(anchorXElement)

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
    const anchorYStyle = getComputedStyle(anchorYElement)

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

  if (window.minitaurDebug) {
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
      let anchorXOverlap = false
      let anchorYOverlap = false

      if (anchorXElement !== document.body) {
        let anchorXLeftOverlap = (
          (left >= anchorXLeft && left < (anchorXLeft + anchorXWidth)) ||
          (left < anchorXLeft && (left + modalWidth) >= anchorXLeft)
        )

        let anchorXTopOverlap = (
          (top >= anchorXTop && top < (anchorXTop + anchorXHeight)) ||
          (top < anchorXTop && (top + modalHeight) >= anchorXTop)
        )

        anchorXOverlap = anchorXLeftOverlap && anchorXTopOverlap
      }

      if (anchorYElement !== document.body) {
        let anchorYLeftOverlap = (
          (left >= anchorYLeft && left < (anchorYLeft + anchorYWidth)) ||
          (left < anchorYLeft && (left + modalWidth) >= anchorYLeft)
        )

        let anchorYTopOverlap = (
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

minitaur.setStyle = (element, styles) => {
  if (window.minitaurDebug) console.log('minitaur.setStyle (' + (element.id ? '#' + element.id : element.tagName) + '):', styles)

  for (let property in styles) {
    element.style[property] = styles[property]
  }
}

minitaur.toggle = (modals, options) => {
  modals = minitaur.getModals(modals, true)

  for (let i = 0; i < modals.length; i++) {
    (function (modal) {
      if (window.minitaurDebug) console.log('minitaur.toggle (#' + modal.id + '):', options)

      if (modal.minitaur.isOpen) {
        modal.minitaur.close(options)
      } else {
        modal.minitaur.open(options)
      }
    })(modals[i])
  }
}

minitaur.triggerEvent = (e) => {
  const actions = ['close', 'open', 'toggle']
  const triggerElement = e.currentTarget
  const opts = minitaur.mergeObjects(minitaur.parseAttributes(triggerElement.dataset), {
    triggeredElement: triggerElement,
    triggeredEvent: e
  })

  for (let i = 0; i < actions.length; i++) {
    let action = actions[i]
    let targetElements = triggerElement.getAttribute('data-minitaur-' + action)

    if (targetElements) {
      if (window.minitaurDebug) console.log('minitaur.triggerEvent:', targetElements, opts)
      minitaur[action](targetElements, opts)
    }
  }
}

export default minitaur
